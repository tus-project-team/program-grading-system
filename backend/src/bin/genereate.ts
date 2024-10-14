import * as fs from "node:fs"

import app from "../app"

const schema = app.getOpenAPI31Document({
  info: {
    license: { name: "" },
    title: "Problem and Submission API",
    version: "0.1.0",
  },
  openapi: "3.1.0",
})

fs.writeFileSync(
  "../generated/openapi/schema.json",
  JSON.stringify(schema, null, 2),
)
