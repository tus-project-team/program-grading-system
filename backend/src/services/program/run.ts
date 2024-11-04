import { z } from "@hono/zod-openapi"

import * as schemas from "../../api/components/schemas"
import { runPythonCode } from "./languages"

type SupportedLanguage = z.infer<typeof schemas.SupportedLanguage>

export const run = ({
  code,
  input,
  language,
}: {
  code: string
  input: string
  language: SupportedLanguage
}) => {
  switch (language.name) {
    case "Python": {
      return runPythonCode(code, input)
    }
    default: {
      throw new Error(`Unsupported language: ${language.name}`)
    }
  }
}
