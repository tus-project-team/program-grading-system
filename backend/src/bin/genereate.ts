import * as fs from "node:fs"

import app, { openApiDocument } from "../app"

const schema = app.getOpenAPI31Document(openApiDocument)

fs.writeFileSync(
  "../generated/openapi/schema.json",
  JSON.stringify(schema, null, 2),
)
