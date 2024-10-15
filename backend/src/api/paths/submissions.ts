import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"

import { Submission } from "../components/schemas"

const app = new OpenAPIHono()

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
app.openapi(getSubmissionsRoute, (c) => {
  // TODO: 実際のデータベースクエリを実装
  const submissions: z.infer<typeof Submission>[] = [
    {
      code: "print('Hello, World!')",
      id: 1,
      language: { name: "Python", version: "3.9" },
      problem_id: 1,
      result: { message: "テストケースにパスしました", status: "Accepted" },
      student_id: 1,
      test_results: [{ message: "正解", status: "Passed", test_case_id: 1 }],
    },
  ]
  return c.json(submissions)
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
    test_results: [{ message: "正解", status: "Passed", test_case_id: 1 }],
  }
  return c.json(submission)
})

export default app
