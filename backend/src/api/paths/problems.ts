import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { PrismaClient } from "@prisma/client"

import { test } from "../../services/program"
import * as schemas from "../components/schemas"

const prisma = new PrismaClient()
const app = new OpenAPIHono()

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
app.openapi(getProblemsRoute, async (c) => {
  const problems = await prisma.problem.findMany({
    include: {
      supportedLanguages: {
        include: {
          language: true,
        },
      },
      testCases: true,
    },
  })

  const formattedProblems = problems.map((problem) => ({
    body: problem.body,
    id: problem.id,
    supported_languages: problem.supportedLanguages.map((supportedLang) => ({
      name: supportedLang.language.name,
      version: supportedLang.language.version,
    })),
    test_cases: problem.testCases.map((testCase) => ({
      input: testCase.input,
      output: testCase.output,
    })),
    title: problem.title,
  }))

  return c.json(formattedProblems, 200)
})

app.openapi(createProblemRoute, async (c) => {
  const data = c.req.valid("json")
  const createdProblem = await prisma.problem.create({
    data: {
      body: data.body,
      supportedLanguages: {
        create: data.supported_languages.map(
          (lang: { name: string; version: string }) => ({
            language: {
              connectOrCreate: {
                create: { name: lang.name, version: lang.version },
                where: {
                  name_version: { name: lang.name, version: lang.version },
                },
              },
            },
          }),
        ),
      },
      testCases: {
        create: data.test_cases.map(
          (testCase: { input: string; output: string }) => ({
            input: testCase.input,
            output: testCase.output,
          }),
        ),
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

  const formattedProblem = {
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
  }
  return c.json(formattedProblem, 201)
})

app.openapi(getProblemRoute, async (c) => {
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
  if (problem == null) {
    return c.body(null, 404)
  }
  return c.json(
    {
      body: problem.body,
      id: problem.id,
      supported_languages: problem.supportedLanguages.map(
        ({ languageName, languageVersion }) => ({
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

app.openapi(updateProblemRoute, async (c) => {
  const { problemId } = c.req.valid("param")
  const data = c.req.valid("json")
  const updatedProblem = await prisma.problem.update({
    data: {
      body: data.body,
      supportedLanguages: {
        create: data.supported_languages?.map(
          (lang: { name: string; version: string }) => ({
            language: {
              connectOrCreate: {
                create: { name: lang.name, version: lang.version },
                where: {
                  name_version: { name: lang.name, version: lang.version },
                },
              },
            },
          }),
        ),
      },
      testCases: {
        create: data.test_cases?.map(
          (testCase: { input: string; output: string }) => ({
            input: testCase.input,
            output: testCase.output,
          }),
        ),
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
  return c.json({
    body: updatedProblem.body,
    id: updatedProblem.id,
    supported_languages: updatedProblem.supportedLanguages.map((lang) => ({
      name: lang.language.name,
      version: lang.language.version,
    })),
    test_cases: updatedProblem.testCases.map((testCase) => ({
      input: testCase.input,
      output: testCase.output,
    })),
    title: updatedProblem.title,
  } satisfies z.infer<typeof schemas.Problem>)
})

app.openapi(deleteProblemRoute, async (c) => {
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

app.openapi(submitProgramRoute, async (c) => {
  const { problemId } = c.req.valid("param")
  const data = c.req.valid("json")

  const problem = await prisma.problem.findUnique({
    include: {
      supportedLanguages: {
        include: { language: true },
      },
      testCases: true,
    },
    where: { id: problemId },
  })
  if (problem == null) {
    return c.body(null, 404)
  }

  const isSupportedLanguage = problem.supportedLanguages.some(
    (lang) =>
      lang.language.name === data.language.name &&
      lang.language.version === data.language.version,
  )
  if (!isSupportedLanguage) {
    // todo: messageとして提出された言語が対応していない旨を返す
    return c.body(null, 400)
  }

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
  const submissionResult = (
    testResults.every((result) => result.status === "Passed")
      ? { message: "テストケースにパスしました", status: "Accepted" }
      : { message: "テストケースにパスできませんでした", status: "WrongAnswer" }
  ) satisfies z.infer<typeof schemas.Submission>["result"]

  const createdSubmission = await prisma.submission.create({
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
        connect: {
          id: problemId,
        },
      },
      result: {
        create: {
          message: submissionResult.message,
          status: {
            connect: {
              status: submissionResult.status,
            },
          },
        },
      },
      student: {
        connect: {
          id: 1, // todo: 実際の学生IDを取得し、指定する
        },
      },
      testResults: {
        createMany: {
          data: testResults.map((result, i) => ({
            message: result.message ?? "",
            statusId: result.status,
            testCaseId: problem.testCases[i].id,
          })),
        },
      },
    },
    include: {
      language: true,
      result: true,
      testResults: true,
    },
  })
  return c.json(createdSubmission, 201)
})

app.openapi(testProgramRoute, (c) => {
  // TODO: 実際のテスト処理を実装
  return c.json([
    { message: "正解", status: "Passed", test_case_id: 1 },
    { message: "正解", status: "Passed", test_case_id: 2 },
  ] as const)
})

app.openapi(getSubmissionsByProblemIdRoute, (c) => {
  const { problemId } = c.req.valid("param")
  // TODO: 実際のデータベースクエリを実装
  const submissions: z.infer<typeof schemas.Submission>[] = [
    {
      code: "print('Hello, World!')",
      id: 1,
      language: { name: "Python", version: "3.9" },
      problem_id: problemId,
      result: { message: "テストケースにパスしました", status: "Accepted" },
      student_id: 1,
      submitted_at: new Date().toISOString(),
      test_results: [{ message: "正解", status: "Passed", test_case_id: 1 }],
    },
  ]
  return c.json(submissions)
})

export default app
