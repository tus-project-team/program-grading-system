import { z } from "@hono/zod-openapi"

import * as schemas from "../../api/components/schemas"
import { run } from "./run"

type Language = z.infer<typeof schemas.Language>

export const test = async ({
  code,
  input,
  language,
  output: expectedOutput,
}: {
  code: string
  input: string
  language: Language
  output: string
}) => {
  const actualOutput = await run({ code, input, language })
}
