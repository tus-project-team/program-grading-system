import { swaggerUI } from "@hono/swagger-ui"
import { OpenAPIHono } from "@hono/zod-openapi"

import problemsApp from "./api/paths/problem"
import submissionsApp from "./api/paths/submit"

const app = new OpenAPIHono()

app.route("/problems", problemsApp)

app.route("/submissions", submissionsApp)

app.doc("/api/openapi.json", {
  info: {
    title: "Problem and Submission API",
    version: "v1",
  },
  openapi: "3.0.0",
})

app.get("/api/docs", swaggerUI({ url: "/api/openapi.json" }))

export default app
