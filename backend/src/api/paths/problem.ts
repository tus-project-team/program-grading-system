import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"

import {
  Problem,
  ProblemCreate,
  ProblemUpdate,
  Submission,
  SubmissionCreate,
} from "../components/schemas"

const app = new OpenAPIHono()

// パラメータスキーマの定義
const IdParam = z.object({
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

// 問題の一覧を取得する
const getProblemsRoute = createRoute({
  method: "get",
  path: "/problems",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(Problem),
        },
      },
      description: "問題の一覧",
    },
  },
})

// 新しい問題を作成する
const createProblemRoute = createRoute({
  method: "post",
  path: "/problems",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ProblemCreate,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: Problem,
        },
      },
      description: "作成された問題",
    },
  },
})

// 問題の詳細を取得する
const getProblemRoute = createRoute({
  method: "get",
  path: "/problems/{id}",
  request: {
    params: IdParam,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: Problem,
        },
      },
      description: "問題の詳細",
    },
    404: {
      description: "指定されたIDの問題が見つかりません",
    },
  },
})

// 問題を更新する
const updateProblemRoute = createRoute({
  method: "put",
  path: "/problems/{id}",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ProblemUpdate,
        },
      },
    },
    params: IdParam,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: Problem,
        },
      },
      description: "更新された問題",
    },
    404: {
      description: "指定されたIDの問題が見つかりません",
    },
  },
})

// 問題を削除する
const deleteProblemRoute = createRoute({
  method: "delete",
  path: "/problems/{id}",
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
})

// 問題に対してプログラムを提出する
const submitProgramRoute = createRoute({
  method: "post",
  path: "/problems/{id}/submit",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SubmissionCreate,
        },
      },
    },
    params: IdParam,
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: Submission,
        },
      },
      description: "提出されたプログラム",
    },
    404: {
      description: "指定されたIDの問題が見つかりません",
    },
  },
})

// 問題に対する提出一覧を取得する
const getSubmissionsRoute = createRoute({
  method: "get",
  path: "/problems/{id}/submissions",
  request: {
    params: IdParam,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(Submission),
        },
      },
      description: "提出一覧",
    },
    404: {
      description: "指定されたIDの問題が見つかりません",
    },
  },
})

// ルートの設定
app.openapi(getProblemsRoute, (c) => {
  // TODO: 実際のデータベースクエリを実装
  const problems: z.infer<typeof Problem>[] = [
    {
      body: "この問題の本文です。",
      id: 1,
      supported_languages: [{ name: "Python", version: "3.9" }],
      test_cases: [{ input: "入力例", output: "出力例" }],
      title: "サンプル問題",
    },
  ]
  return c.json(problems)
})

app.openapi(createProblemRoute, (c) => {
  const problem = c.req.valid("json")
  // TODO: 実際のデータベース挿入処理を実装
  const createdProblem: z.infer<typeof Problem> = {
    id: Date.now(), // 仮のID生成
    ...problem,
  }
  return c.json(createdProblem, 201)
})

app.openapi(getProblemRoute, (c) => {
  const { id } = c.req.valid("param")
  // TODO: 実際のデータベースクエリを実装
  const problem: z.infer<typeof Problem> = {
    body: "この問題の本文です。",
    id: parseInt(id),
    supported_languages: [{ name: "Python", version: "3.9" }],
    test_cases: [{ input: "入力例", output: "出力例" }],
    title: "サンプル問題",
  }
  return c.json(problem)
})

app.openapi(updateProblemRoute, (c) => {
  const { id } = c.req.valid("param")
  const updateData = c.req.valid("json")
  // TODO: 実際のデータベース更新処理を実装
  const updatedProblem: z.infer<typeof Problem> = {
    body: updateData.body ?? "更新された本文",
    id: parseInt(id),
    supported_languages: updateData.supported_languages ?? [
      { name: "JavaScript", version: "ES2021" },
    ],
    test_cases: updateData.test_cases ?? [
      { input: "新しい入力", output: "新しい出力" },
    ],
    title: updateData.title ?? "更新された問題",
  }
  return c.json(updatedProblem)
})

app.openapi(deleteProblemRoute, (c) => {
  // TODO: 実際のデータベース削除処理を実装
  return c.body(null, 204)
})

app.openapi(submitProgramRoute, (c) => {
  const { id } = c.req.valid("param")
  // TODO: 実際の提出処理とジャッジ処理を実装
  const createdSubmission: z.infer<typeof Submission> = {
    code: "print('Hello, World!')",
    id: Date.now(),
    language: { name: "Python", version: "3.9" },
    problem_id: parseInt(id),
    result: { message: "テストケースにパスしました", status: "Accepted" },
    student_id: 1, // 仮の学生ID
    test_results: [{ message: "正解", status: "Passed", test_case_id: 1 }],
  }
  return c.json(createdSubmission, 201)
})

app.openapi(getSubmissionsRoute, (c) => {
  const { id } = c.req.valid("param")
  // TODO: 実際のデータベースクエリを実装
  const submissions: z.infer<typeof Submission>[] = [
    {
      code: "print('Hello, World!')",
      id: 1,
      language: { name: "Python", version: "3.9" },
      problem_id: parseInt(id),
      result: { message: "テストケースにパスしました", status: "Accepted" },
      student_id: 1,
      test_results: [{ message: "正解", status: "Passed", test_case_id: 1 }],
    },
  ]
  return c.json(submissions)
})

// OpenAPI ドキュメントの設定
app.doc("", () => ({
  info: {
    title: "Problems API",
    version: "v1",
  },
  openapi: "3.0.0",
}))

export default app
