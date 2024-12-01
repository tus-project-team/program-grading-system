import type { Context, Next } from "hono"

import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server"
import { jwt, sign } from "hono/jwt"

import { prisma } from "../../db"
import * as schemas from "../components/schemas/auth"

// 環境設定
const RP_ID = "localhost"
const RP_NAME = "Shuiro"
const RP_ORIGIN = `https://${RP_ID}:5173`
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// JWT関連の関数
const createToken = async (payload: { role: string; sub: string }) => {
  return await sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24時間有効
    },
    JWT_SECRET,
  )
}

// JWT認証ミドルウェア
const jwtMiddleware = jwt({
  secret: JWT_SECRET,
})

// 認証ミドルウェア
export const authMiddleware = async (c: Context, next: Next) => {
  const auth = c.req.header("Authorization")
  if (!auth?.startsWith("Bearer ")) {
    return c.json({ error: "認証が必要です" }, 401)
  }

  try {
    await jwtMiddleware(c, next)
  } catch {
    return c.json({ error: "無効なトークンです" }, 401)
  }
}

// ロールベースの認可ミドルウェア
export const requireRole = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    const payload = c.get("jwtPayload")
    if (!allowedRoles.includes(payload.role)) {
      return c.json({ error: "権限がありません" }, 403)
    }
    await next()
  }
}

// ルート定義
const registerRoute = createRoute({
  method: "post",
  path: "/register",
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.UserRegistration,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: schemas.AuthenticationChallenge,
        },
      },
      description: "登録チャレンジの生成",
    },
    400: {
      description: "無効なリクエストまたは既に登録済み",
    },
  },
  summary: "ユーザー登録の開始",
  tags: ["auth"],
})

const verifyRegistrationRoute = createRoute({
  method: "post",
  path: "/register/verify",
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.RegistrationCredential,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: schemas.AuthenticationResponse,
        },
      },
      description: "登録成功とトークン発行",
    },
    400: {
      description: "検証失敗",
    },
  },
  summary: "登録の検証とトークン発行",
  tags: ["auth"],
})

const authenticateRoute = createRoute({
  method: "post",
  path: "/authenticate",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ email: z.string().email() }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: schemas.AuthenticationChallenge,
        },
      },
      description: "認証チャレンジの生成",
    },
    400: {
      description: "認証情報が登録されていません",
    },
    404: {
      description: "ユーザーが見つかりません",
    },
  },
  summary: "認証の開始",
  tags: ["auth"],
})

const verifyAuthenticationRoute = createRoute({
  method: "post",
  path: "/authenticate/verify",
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.AuthenticationCredential,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: schemas.AuthenticationResponse,
        },
      },
      description: "認証成功とトークン発行",
    },
    401: {
      description: "認証失敗",
    },
  },
  summary: "認証の検証とトークン発行",
  tags: ["auth"],
})

// OpenAPI Honoアプリケーションの定義
const app = new OpenAPIHono()
.openapi(registerRoute, async (c) => {
  const { email, name, role } = c.req.valid("json")
  console.log("Registration Request:", { email, name, role });

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })
  if (existingUser) {
    return c.json({ error: "既に登録済みのメールアドレスです" }, 400)
  }

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: { email, name, role },
    })

    if (role === "student") {
      await tx.student.create({
        data: {
          userId: createdUser.id,
        },
      })
    } else if (role === "teacher") {
      await tx.teacher.create({
        data: {
          userId: createdUser.id,
        },
      })
    }

    return createdUser
  })

  const options = await generateRegistrationOptions({
    rpID: RP_ID,
    rpName: RP_NAME,
    userID: Buffer.from(user.id),
    userName: user.email,
    attestationType: "none",
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      requireResidentKey: true,
      residentKey: "required",
      userVerification: "required"
    },
  })

  console.log("Generated Registration Options:", options);

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分後
  const savedChallenge = await prisma.challenge.create({
    data: {
      challenge: options.challenge,
      userId: user.id,
      expiresAt,
    },
  })

  console.log("Saved Challenge:", savedChallenge);

  return c.json(options)
})
  .openapi(verifyRegistrationRoute, async (c) => {
    const credentialData = c.req.valid("json")
    console.log("Verification Request Data:", credentialData);

    const challenge = await prisma.challenge.findFirst({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      where: {
        expiresAt: { gt: new Date() },
        user: { credentials: { none: {} } },
      },
    })
    console.log("Found Challenge:", challenge);

    if (!challenge) {
      console.log("No valid challenge found");
      return c.json({ error: "無効なチャレンジです" }, 400)
    }

    if (challenge.expiresAt < new Date()) {
      console.log("Challenge expired:", {
        expiresAt: challenge.expiresAt,
        now: new Date()
      });
      return c.json({ error: "チャレンジの有効期限が切れています" }, 400)
    }

    try {
      console.log("Verification Params:", {
        expectedChallenge: challenge.challenge,
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
        responseData: {
          ...credentialData,
          clientExtensionResults: {},
        }
      });

      const verification = await verifyRegistrationResponse({
        expectedChallenge: challenge.challenge,
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
        response: {
          ...credentialData,
          clientExtensionResults: {},
        },
      })

      console.log("Verification Result:", verification);

      if (verification.verified && verification.registrationInfo) {
        const { credential } = verification.registrationInfo
        
        await prisma.credential.create({
          data: {
            counter: credential.counter,
            id: credential.id,
            publicKey: Buffer.from(credential.publicKey),
            userId: challenge.userId,
          },
        })

        const token = await createToken({
          role: challenge.user.role,
          sub: challenge.userId,
        })

        return c.json({ token })
      }
    } catch (error) {
      console.error("Verification Error:", error)
    }

    return c.json({ error: "検証に失敗しました" }, 400)
  })
  .openapi(authenticateRoute, async (c) => {
    const { email } = c.req.valid("json")

    const user = await prisma.user.findUnique({
      include: { credentials: true },
      where: { email },
    })
    if (!user) {
      return c.json({ error: "ユーザーが見つかりません" }, 404)
    }

    if (user.credentials.length === 0) {
      return c.json({ error: "認証情報が登録されていません" }, 400)
    }

    const options = await generateAuthenticationOptions({
      allowCredentials: user.credentials.map((cred) => ({
        id: base64ToBase64URL(cred.id), // Base64をBase64URLに変換
        type: 'public-key',
        transports: [],
      })),
      rpID: RP_ID,
      userVerification: "required",
    })

    await prisma.challenge.create({
      data: {
        challenge: options.challenge,
        userId: user.id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5分の有効期限
      },
    })

    return c.json(options)
})


.openapi(verifyAuthenticationRoute, async (c) => {
  const credentialData = c.req.valid("json")
  console.log("Received authentication data:", credentialData);

  const userCredential = await prisma.credential.findUnique({
    include: { user: true },
    where: { id: credentialData.id },
  })
  console.log("Found user credential:", userCredential);

  if (!userCredential) {
    return c.json({ error: "認証情報が見つかりません" }, 401)
  }

  const challenge = await prisma.challenge.findFirst({
    orderBy: { createdAt: "desc" },
    where: {
      expiresAt: { gt: new Date() },
      userId: userCredential.userId,
    },
  })
  console.log("Found challenge:", challenge);

  if (!challenge) {
    return c.json({ error: "無効なチャレンジです" }, 401)
  }

  try {
    const verification = await verifyAuthenticationResponse({
      credential: {
        counter: Number(userCredential.counter),
        id: base64ToBase64URL(userCredential.id),
        publicKey: new Uint8Array(userCredential.publicKey),
        transports: [],
      },
      expectedChallenge: challenge.challenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
      response: {
        ...credentialData,
        clientExtensionResults: {},
      },
    })
    console.log("Verification result:", verification);

    if (verification.verified) {
      await prisma.credential.update({
        data: { counter: verification.authenticationInfo.newCounter },
        where: { id: userCredential.id },
      })

      const token = await createToken({
        role: userCredential.user.role,
        sub: userCredential.userId,
      })

      return c.json({ token })
    }
  } catch (error) {
    console.error("Verification error:", error)
  }

  return c.json({ error: "認証に失敗しました" }, 401)
})
// Base64 を Base64URL に変換する関数を追加
function base64ToBase64URL(base64: string): string {
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export default Object.assign(app, {
  authMiddleware,
  requireRole,
})
