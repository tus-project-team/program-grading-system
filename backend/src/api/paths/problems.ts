import type { Context, Next } from "hono"

import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"

import { prisma } from "../../db"
import { test } from "../../services/program"
import * as schemas from "../components/schemas"
import { authMiddleware, requireRole } from "./auth"

// パラメータスキーマの定義
const IdParam = z.object({
  problemId: z
    .string()
    .pipe(z.coerce.number().int().nonnegative())
    .openapi({
      example: "1",
      param: {
        in: "path",
        name: "problemId",
      },
      type: "integer",
    }),
})

// ユーザーロールの定義
const ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
  TEACHER: "teacher",
} as const

// 認証済みユーザー情報を取得するユーティリティ関数
const getCurrentUser = (c: Context) => {
  const payload = c.get("jwtPayload")
  return {
    id: payload.sub,
    role: payload.role,
  }
}

// 問題作成者または管理者のみアクセス可能なミドルウェア
const requireProblemOwner = () => {
  return async (
    c: Context<{ Bindings: object; ParamKeys: string; Variables: object }>,
    next: Next,
  ) => {
    const params = c.req.param()
    const problemId = Number(params.problemId)

    const currentUser = getCurrentUser(c)

    const problem = await prisma.problem.findUnique({
      include: { teachers: true },
      where: { id: problemId },
    })

    if (!problem) {
      return c.json({ error: "問題が見つかりません" }, 404)
    }

    if (
      currentUser.role !== ROLES.ADMIN &&
      !problem.teachers.some((teacher) => teacher.userId === currentUser.id)
    ) {
      return c.json({ error: "権限がありません" }, 403)
    }

    await next()
  }
}

const getProblemsRoute = createRoute({
  method: "get",
  operationId: "getProblems",
  path: "/problems",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(schemas.Problem),
        },
      },
      description: "問題の一覧",
    },
  },
  summary: "問題の一覧を取得する",
  tags: ["problems"],
})

const createProblemRoute = createRoute({
  method: "post",
  operationId: "createProblem",
  path: "/problems",
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.ProblemCreate,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: schemas.Problem,
        },
      },
      description: "作成された問題",
    },
  },
  summary: "新しい問題を作成する",
  tags: ["problems"],
})

const getProblemRoute = createRoute({
  method: "get",
  operationId: "getProblemById",
  path: "/problems/{problemId}",
  request: {
    params: IdParam,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: schemas.Problem,
        },
      },
      description: "問題の詳細",
    },
    404: {
      description: "指定されたIDの問題が見つかりません",
    },
  },
  summary: "問題の詳細を取得する",
  tags: ["problems"],
})

const updateProblemRoute = createRoute({
  method: "put",
  operationId: "updateProblem",
  path: "/problems/{problemId}",
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.ProblemUpdate,
        },
      },
    },
    params: IdParam,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: schemas.Problem,
        },
      },
      description: "更新された問題",
    },
    404: {
      description: "指定されたIDの問題が見つかりません",
    },
  },
  summary: "問題を更新する",
  tags: ["problems"],
})

const deleteProblemRoute = createRoute({
  method: "delete",
  operationId: "deleteProblem",
  path: "/problems/{problemId}",
  request: {
    params: IdParam,
  },
  responses: {
    204: {
      description: "問題が削除されました",
    },
    404: {
      description: "指定されたIDの問題が見つかりません",
    },
  },
  summary: "問題を削除する",
  tags: ["problems"],
})

const submitProgramRoute = createRoute({
  method: "post",
  operationId: "submitProgram",
  path: "/problems/{problemId}/submit",
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.SubmissionCreate,
        },
      },
    },
    params: IdParam,
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: schemas.Submission,
        },
      },
      description: "提出されたプログラム",
    },
    400: {
      description: "提出データが不正です",
    },
    404: {
      description: "指定されたIDの問題が見つかりません",
    },
  },
  summary: "問題に対してプログラムを提出する",
  tags: ["problems"],
})

const testProgramRoute = createRoute({
  method: "post",
  operationId: "testProgram",
  path: "/problems/{problemId}/test",
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.SubmissionCreate,
        },
      },
    },
    params: IdParam,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(schemas.TestResult),
        },
      },
      description: "提出されたプログラムのテスト結果",
    },
  },
  summary: "問題に対してプログラムをテストする",
  tags: ["problems"],
})

const getSubmissionsByProblemIdRoute = createRoute({
  method: "get",
  operationId: "getSubmissionsByProblemId",
  path: "/problems/{problemId}/submissions",
  request: {
    params: IdParam,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(schemas.Submission),
        },
      },
      description: "提出一覧",
    },
    404: {
      description: "指定されたIDの問題が見つかりません",
    },
  },
  summary: "問題に対する提出一覧を取得する",
  tags: ["problems"],
})

// ルートの設定
const app = new OpenAPIHono()
  // 問題一覧の取得
  .openapi(getProblemsRoute, async (c, next) => {
    await authMiddleware(c, next)
    const problems = await prisma.problem.findMany({
      include: {
        supportedLanguages: {
          include: { language: true },
        },
        testCases: true,
      },
    })

    const formattedProblems: z.infer<typeof schemas.Problem>[] = problems.map(
      (problem) => ({
        body: problem.body,
        id: problem.id,
        supported_languages: problem.supportedLanguages.map((lang) => ({
          name: lang.language.name,
          version: lang.language.version,
        })),
        test_cases: problem.testCases.map((testCase) => ({
          input: testCase.input,
          output: testCase.output,
        })),
        title: problem.title,
      }),
    )

    return c.json(formattedProblems)
  })
  // 個別の問題の取得
  .openapi(getProblemRoute, async (c) => {
    const { problemId } = c.req.valid("param")
    const problem = await prisma.problem.findUnique({
      include: {
        supportedLanguages: {
          include: { language: true },
        },
        testCases: true,
      },
      where: { id: problemId },
    })

    if (!problem) {
      return c.json({ error: "問題が見つかりません" }, 404)
    }

    return c.json(
      {
        body: problem.body,
        id: problem.id,
        supported_languages: problem.supportedLanguages.map(
          ({ language: { name: languageName, version: languageVersion } }) => ({
            name: languageName,
            version: languageVersion,
          }),
        ),
        test_cases: problem.testCases.map(({ input, output }) => ({
          input,
          output,
        })),
        title: problem.title,
      },
      200,
    )
  })
  // 問題の作成
  .openapi(createProblemRoute, async (c, next) => {
    await authMiddleware(c, next)
    await requireRole([ROLES.TEACHER, ROLES.ADMIN])(c, next)
    const data = c.req.valid("json")
    const currentUser = getCurrentUser(c)

    const createdProblem = await prisma.problem.create({
      data: {
        body: data.body,
        supportedLanguages: {
          create: data.supported_languages.map((lang) => ({
            language: {
              connectOrCreate: {
                create: {
                  name: lang.name,
                  version: lang.version,
                },
                where: {
                  name_version: {
                    name: lang.name,
                    version: lang.version,
                  },
                },
              },
            },
          })),
        },
        teachers: {
          connect: {
            userId: currentUser.id,
          },
        },
        testCases: {
          create: data.test_cases.map((testCase) => ({
            input: testCase.input,
            output: testCase.output,
          })),
        },
        title: data.title,
      },
      include: {
        supportedLanguages: {
          include: {
            language: true,
          },
        },
        testCases: true,
      },
    })

    return c.json(
      {
        body: createdProblem.body,
        id: createdProblem.id,
        supported_languages: createdProblem.supportedLanguages.map((lang) => ({
          name: lang.language.name,
          version: lang.language.version,
        })),
        test_cases: createdProblem.testCases.map((testCase) => ({
          input: testCase.input,
          output: testCase.output,
        })),
        title: createdProblem.title,
      },
      201,
    )
  })
  .openapi(getProblemsRoute, async (c, next) => {
    // nextを引数として受け取る
    await authMiddleware(c, next)
    const problems = await prisma.problem.findMany({
      include: {
        supportedLanguages: {
          include: { language: true },
        },
        testCases: true,
      },
    })

    const formattedProblems: z.infer<typeof schemas.Problem>[] = problems.map(
      (problem) => ({
        body: problem.body,
        id: problem.id,
        supported_languages: problem.supportedLanguages.map((lang) => ({
          name: lang.language.name,
          version: lang.language.version,
        })),
        test_cases: problem.testCases.map((testCase) => ({
          input: testCase.input,
          output: testCase.output,
        })),
        title: problem.title,
      }),
    )

    return c.json(formattedProblems)
  })

  .openapi(updateProblemRoute, async (c) => {
    await authMiddleware(c, next)
    requireProblemOwner()

    const { problemId } = c.req.valid("param")
    const data = c.req.valid("json")

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    })
    if (!problem) {
      return c.body(null, 404)
    }

    const updatedProblem = await prisma.$transaction(async (tx) => {
      await tx.language.deleteMany({
        where: { problemId },
      })
      await tx.testCase.deleteMany({
        where: { problemId },
      })
      const updated = await tx.problem.update({
        data: {
          body: data.body,
          supportedLanguages: {
            create: data.supported_languages.map(({ name, version }) => ({
              language: {
                connect: {
                  name_version: { name, version },
                },
              },
            })),
            deleteMany: {
              languageName: {
                notIn: data.supported_languages.map(({ name }) => name),
              },
              languageVersion: {
                notIn: data.supported_languages.map(({ version }) => version),
              },
            },
          },
          testCases: {
            create: data.test_cases.map(({ input, output }) => ({
              input,
              output,
            })),
            deleteMany: {
              AND: {
                input: {
                  notIn: data.test_cases.map(({ input }) => input),
                },
                output: {
                  notIn: data.test_cases.map(({ output }) => output),
                },
              },
            },
          },
          title: data.title,
        },
        include: {
          supportedLanguages: {
            include: {
              language: true,
            },
          },
          testCases: true,
        },
        where: {
          id: problemId,
        },
      })
      return updated
    })

    return c.json({
      body: updatedProblem.body,
      id: updatedProblem.id,
      supported_languages: updatedProblem.supportedLanguages
        .map((lang) => ({
          name: lang.language.name,
          version: lang.language.version,
        }))
        .sort((a, b) =>
          a.name === b.name
            ? a.version.localeCompare(b.version)
            : a.name.localeCompare(b.name),
        ),
      test_cases: updatedProblem.testCases.map((testCase) => ({
        input: testCase.input,
        output: testCase.output,
      })),
      title: updatedProblem.title,
    })
  })
  .openapi(deleteProblemRoute, async (c) => {
    await authMiddleware(c, next)
    requireProblemOwner()

    const { problemId } = c.req.valid("param")

    try {
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
      })

      if (!problem) {
        return c.body(null, 404)
      }

      await prisma.$transaction(async (tx) => {
        await tx.testResult.deleteMany({
          where: {
            submission: {
              problemId,
            },
          },
        })

        await tx.submissionResult.deleteMany({
          where: {
            submission: {
              problemId,
            },
          },
        })

        await tx.submission.deleteMany({
          where: { problemId },
        })

        await tx.testCase.deleteMany({
          where: { problemId },
        })

        await tx.language.deleteMany({
          where: { problemId },
        })

        await tx.problem.update({
          data: {
            teachers: {
              set: [],
            },
          },
          where: { id: problemId },
        })

        await tx.problem.delete({
          where: { id: problemId },
        })
      })

      return c.body(null, 204)
    } catch (error) {
      console.error("Problem deletion failed:", error)
      return c.body(null, 500)
    }
  })
  .openapi(submitProgramRoute, async (c) => {
    await authMiddleware(c, next)
    await requireRole([ROLES.STUDENT])(c, next)

    const { problemId } = c.req.valid("param")
    const data = c.req.valid("json")
    const currentUser = getCurrentUser(c)

    // 学生情報の取得
    const student = await prisma.student.findUnique({
      where: { userId: currentUser.id },
    })

    if (!student) {
      return c.json({ error: "学生情報が見つかりません" }, 400)
    }

    // 問題の取得と言語サポートの確認
    const problem = await prisma.problem.findUnique({
      include: {
        supportedLanguages: {
          include: { language: true },
        },
        testCases: true,
      },
      where: { id: problemId },
    })

    if (!problem) {
      return c.json({ error: "問題が見つかりません" }, 404)
    }

    const isLanguageSupported = problem.supportedLanguages.some(
      (lang) =>
        lang.language.name === data.language.name &&
        lang.language.version === data.language.version,
    )

    if (!isLanguageSupported) {
      return c.json(
        { error: "サポートされていないプログラミング言語です" },
        400,
      )
    }

    // テストの実行
    const testResults = await Promise.all(
      problem.testCases.map(async (testCase) =>
        test({
          code: data.code,
          input: testCase.input,
          language: data.language,
          output: testCase.output,
        }),
      ),
    )

    // 提出結果の判定
    const allTestsPassed = testResults.every(
      (result) => result.status === "Passed",
    )
    const submissionStatus = allTestsPassed ? "Accepted" : "WrongAnswer"
    const submissionMessage = allTestsPassed
      ? "すべてのテストケースにパスしました"
      : "いくつかのテストケースにパスできませんでした"

    // 提出の保存
    const submission = await prisma.submission.create({
      data: {
        code: data.code,
        language: {
          connect: {
            name_version: {
              name: data.language.name,
              version: data.language.version,
            },
          },
        },
        problem: {
          connect: { id: problemId },
        },
        result: {
          create: {
            message: submissionMessage,
            status: {
              connect: { status: submissionStatus },
            },
          },
        },
        student: {
          connect: { id: student.id },
        },
        testResults: {
          create: testResults.map((result, index) => ({
            message: result.message ?? "",
            status: {
              connect: { status: result.status },
            },
            testCase: {
              connect: { id: problem.testCases[index].id },
            },
          })),
        },
      },
      include: {
        language: true,
        result: {
          include: {
            status: true,
          },
        },
        testResults: {
          include: {
            status: true,
            testCase: true,
          },
        },
      },
    })

    const formattedSubmission: z.infer<typeof schemas.Submission> = {
      code: submission.code,
      id: submission.id,
      language: {
        name: submission.languageName,
        version: submission.languageVersion,
      },
      problem_id: submission.problemId,
      result: {
        message: submission.result.message,
        status: submission.result.status.status as
          | "Accepted"
          | "CompileError"
          | "RuntimeError"
          | "WrongAnswer",
      },
      student_id: submission.studentId,
      submitted_at: submission.createdAt.toISOString(),
      test_results: submission.testResults.map((result) => ({
        message: result.message,
        status: (result.status.status === "Accepted" ? "Passed" : "Failed") as
          | "Failed"
          | "Passed",
        test_case_id: result.testCaseId,
      })),
    }

    return c.json(formattedSubmission, 201)
  })
  .openapi(testProgramRoute, async (c) => {
    await authMiddleware(c, next)
    await requireRole([ROLES.STUDENT])(c, next)

    const { problemId } = c.req.valid("param")
    const data = c.req.valid("json")

    const problem = await prisma.problem.findUnique({
      include: {
        testCases: true,
      },
      where: { id: problemId },
    })

    if (!problem) {
      throw new Error("問題が見つかりません")
    }

    const testResults = await Promise.all(
      problem.testCases.map(async (testCase) => {
        const result = await test({
          code: data.code,
          input: testCase.input,
          language: data.language,
          output: testCase.output,
        })

        return {
          message: result.message ?? "",
          status: result.status as "Failed" | "Passed",
          test_case_id: testCase.id,
        } satisfies z.infer<typeof schemas.TestResult>
      }),
    )

    return c.json(testResults, 200)
  })
  .openapi(getSubmissionsByProblemIdRoute, async (c, next) => {
    try {
      // 認証処理
      await authMiddleware(c, next)
      console.log("Auth middleware passed") // デバッグ用

      // ユーザー情報の取得を try-catch で囲む
      let currentUser
      try {
        currentUser = getCurrentUser(c)
        console.log("Current user:", currentUser) // デバッグ用
      } catch (error) {
        console.error("Failed to get current user:", error)
        return c.json({ error: "認証エラー" }, 401)
      }

      const { problemId } = c.req.valid("param")
      console.log("Fetching submissions for problem:", problemId)

      // 問題の存在確認
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
      })

      if (!problem) {
        return c.json({ error: "問題が見つかりません" }, 404)
      }

      // 権限チェック
      const isTeacher = currentUser.role === ROLES.TEACHER
      const isAdmin = currentUser.role === ROLES.ADMIN

      if (!isTeacher && !isAdmin) {
        return c.json({ error: "権限がありません" }, 403)
      }

      // 提出一覧の取得
      const submissions = await prisma.submission.findMany({
        include: {
          language: true,
          result: {
            include: {
              status: true,
            },
          },
          testResults: {
            include: {
              status: true,
              testCase: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        where: {
          problemId,
          ...(isTeacher
            ? {
                problem: {
                  teachers: {
                    some: {
                      userId: currentUser.id,
                    },
                  },
                },
              }
            : {}),
        },
      })

      console.log(`Found ${submissions.length} submissions`)

      return c.json(
        submissions.map((submission) => ({
          code: submission.code,
          id: submission.id,
          language: {
            name: submission.language.name,
            version: submission.language.version,
          },
          problem_id: submission.problemId,
          result: {
            message: submission.result.message,
            status: submission.result.status.status,
          },
          student_id: submission.studentId,
          submitted_at: submission.createdAt.toISOString(),
          test_results: submission.testResults.map((result) => ({
            message: result.message,
            status: result.status.status === "Accepted" ? "Passed" : "Failed",
            test_case_id: result.testCaseId,
          })),
        })),
      )
    } catch (error) {
      console.error("Error in getSubmissionsByProblemId:", error)
      const message =
        error instanceof Error ? error.message : "Internal server error"
      return c.json({ error: message }, 500)
    }
  })

export default app
function next(): Promise<void> {
  throw new Error("Function not implemented.")
}
