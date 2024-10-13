import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"

import { Submission } from "../components/schemas"

const app = new OpenAPIHono()

// パラメータスキーマの定義
const SubmissionIdParam = z.object({
  id: z
    .string()
    .min(1)
    .openapi({
      example: "1",
      param: {
        in: "path",
        name: "id",
      },
    }),
})

// 提出一覧を取得する
const getSubmissionsRoute = createRoute({
  method: "get",
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
})

// 提出の詳細を取得する
const getSubmissionByIdRoute = createRoute({
  method: "get",
  path: "/submissions/{id}",
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
  const { id } = c.req.valid("param")
  // TODO: 実際のデータベースクエリを実装
  const submission: z.infer<typeof Submission> = {
    code: "print('Hello, World!')",
    id: parseInt(id),
    language: { name: "Python", version: "3.9" },
    problem_id: 1,
    result: { message: "テストケースにパスしました", status: "Accepted" },
    student_id: 1,
    test_results: [{ message: "正解", status: "Passed", test_case_id: 1 }],
  }
  return c.json(submission)
})

app.doc("", () => ({
  info: {
    title: "Submissions API",
    version: "v1",
  },
  openapi: "3.0.0",
}))

export default app
