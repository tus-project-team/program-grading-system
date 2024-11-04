import { z } from "@hono/zod-openapi"

import * as schemas from "../../api/components/schemas"
import { run } from "./run"

type SupportedLanguage = z.infer<typeof schemas.SupportedLanguage>

type TestResult = Omit<z.infer<typeof schemas.TestResult>, "test_case_id">

export const test = async ({
  code,
  input,
  language,
  output: expectedOutput,
}: {
  code: string
  input: string
  language: SupportedLanguage
  output: string
}): Promise<TestResult> => {
  const result = await run({ code, input, language })
  const actualOutput = result.stdout
  return actualOutput === expectedOutput
    ? { status: "Passed" }
    : { status: "Failed" }
}
