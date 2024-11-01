import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { PrismaClient } from "@prisma/client"

import { Submission, SubmissionStatus, TestResult } from "../components/schemas"

const app = new OpenAPIHono()
const prisma = new PrismaClient()

type SubmissionStatusType = z.infer<typeof SubmissionStatus>
type TestStatusType = "Failed" | "Passed"

const isValidSubmissionStatus = (
  status: string,
): status is SubmissionStatusType => {
  return ["Accepted", "CompileError", "RuntimeError", "WrongAnswer"].includes(
    status as SubmissionStatusType,
  )
}

const isValidTestStatus = (status: string): status is TestStatusType => {
  return ["Failed", "Passed"].includes(status as TestStatusType)
}

// パラメータスキーマの定義
const SubmissionIdParam = z.object({
  submissionId: z
    .number()
    .int()
    .nonnegative()
    .openapi({
      example: 1,
      param: {
        in: "path",
        name: "submissionId",
      },
    }),
})

const getSubmissionsRoute = createRoute({
  method: "get",
  operationId: "getSubmissions",
  path: "/submissions",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(Submission),
        },
      },
      description: "提出一覧",
    },
  },
  summary: "提出一覧を取得する",
  tags: ["submissions"],
})

const getSubmissionByIdRoute = createRoute({
  method: "get",
  operationId: "getSubmissionById",
  path: "/submissions/{submissionId}",
  request: {
    params: SubmissionIdParam,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: Submission,
        },
      },
      description: "提出の詳細",
    },
    404: {
      description: "指定されたIDの提出が見つかりません",
    },
  },
  summary: "提出の詳細を取得する",
  tags: ["submissions"],
})

// ルートの設定
app.openapi(getSubmissionsRoute, async (c) => {
  const submissions = await prisma.submission.findMany({
    include: {
      language: true,
      problem: true,
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
  })

  const formattedSubmissions = submissions.map((submission) => {
    const submissionStatus = submission.result.status.status
    if (!isValidSubmissionStatus(submissionStatus)) {
      throw new Error(`Invalid submission status: ${submissionStatus}`)
    }

    const formattedTestResults = submission.testResults.map((result) => {
      const testStatus = result.status.status
      if (!isValidTestStatus(testStatus)) {
        throw new Error(`Invalid test status: ${testStatus}`)
      }

      return {
        message: result.message,
        status: testStatus,
        test_case_id: result.testCaseId,
      } satisfies z.infer<typeof TestResult>
    })

    return {
      code: submission.code,
      id: submission.id,
      language: {
        name: submission.languageName,
        version: submission.languageVersion,
      },
      problem_id: submission.problemId,
      result: {
        message: submission.result.message,
        status: submissionStatus,
      },
      student_id: submission.studentId,
      submitted_at: submission.createdAt.toISOString(),
      test_results: formattedTestResults,
    } satisfies z.infer<typeof Submission>
  })

  return c.json(formattedSubmissions)
})

app.openapi(getSubmissionByIdRoute, (c) => {
  const { submissionId } = c.req.valid("param")
  // TODO: 実際のデータベースクエリを実装
  const submission: z.infer<typeof Submission> = {
    code: "print('Hello, World!')",
    id: submissionId,
    language: { name: "Python", version: "3.9" },
    problem_id: 1,
    result: { message: "テストケースにパスしました", status: "Accepted" },
    student_id: 1,
    submitted_at: new Date().toISOString(),
    test_results: [{ message: "正解", status: "Passed", test_case_id: 1 }],
  }
  return c.json(submission)
})

export default app
