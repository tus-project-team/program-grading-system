import { z } from "@hono/zod-openapi"

import * as schemas from "../../api/components/schemas"
import { runPythonCode } from "./languages"

type Language = z.infer<typeof schemas.Language>

export const run = ({
  code,
  input,
  language,
}: {
  code: string
  input: string
  language: Language
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
