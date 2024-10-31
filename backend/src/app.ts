import { OpenAPIHono } from "@hono/zod-openapi"
import { apiReference } from "@scalar/hono-api-reference"
import { cors } from "hono/cors"

import problemsApp from "./api/paths/problems"
import submissionsApp from "./api/paths/submissions"

const app = new OpenAPIHono()

app.use(
  "/api/*",
  cors({
    allowHeaders: ["Content-Type"],
    origin: "http://localhost:5173",
  }),
)
app.route("/api", problemsApp)
app.route("/api", submissionsApp)

export const openApiDocument = {
  info: {
    license: { name: "" },
    title: "Problem and Submission API",
    version: "0.1.0",
  },
  openapi: "3.1.0",
} as const satisfies ReturnType<typeof app.getOpenAPI31Document>

app.doc("/api/openapi.json", openApiDocument)

app.get("/api/docs", apiReference({ spec: { url: "/api/openapi.json" } }))

export default app
