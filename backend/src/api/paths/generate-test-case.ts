import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"

import { evaluateDSL } from "../../services/dsl"
import { run } from "../../services/program/run"

const generateTestCase = createRoute({
  method: "post",
  operationId: "generateTestCase",
  path: "/generate-test-case",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.string(),
            inputStatus: z.string(),
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
  .openapi(generateTestCase, async (c) => {
    const { code, inputStatus, language } = c.req.valid("json")
    
    const inputGenerator = evaluateDSL(inputStatus)
    const generatedInput = inputGenerator()

    const finalInput = typeof generatedInput === 'string' ? generatedInput : JSON.stringify(generatedInput)

    const result = await run({ code, input: finalInput, language })
    return c.json({ output: result.stdout }, 200)
  })

export default app