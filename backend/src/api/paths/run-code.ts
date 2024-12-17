import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"

import { run } from "../../services/program/run"

const runCodeRoute = createRoute({
  method: "post",
  operationId: "runCode",
  path: "/run-code",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.string(),
            input: z.string(),
            language: z.object({
              name: z.string(),
              version: z.string(),
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            output: z.string(),
          }),
        },
      },
      description: "実行結果",
    },
  },
  summary: "コードを実行し、出力を返す",
  tags: ["code"],
})

const app = new OpenAPIHono()
  .openapi(runCodeRoute, async (c) => {
  const { code, input, language } = c.req.valid("json")
  const result = await run({ code, input, language })
  return c.json({ output: result.stdout }, 200)
  })

export default app