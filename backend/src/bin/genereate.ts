import { OpenAPIHono, z } from "@hono/zod-openapi"
import * as fs from "fs"

import * as schemas from "../api/components/schemas"
import problemsApp from "../api/paths/problems"
import submissionsApp from "../api/paths/submissions"

const app = new OpenAPIHono()

app.route("/api", problemsApp)
app.route("/api", submissionsApp)

const openApiDocument = {
  components: {
    schemas: {} as Record<string, any>,
  },
  info: {
    license: { name: "" },
    title: "Problem and Submission API",
    version: "0.1.0",
  },
  openapi: "3.1.0",
  paths: {} as Record<string, any>,
}

app.doc("/api/openapi.json", () => {
  const routes = app.routes
    .filter((route) => route.method !== "ALL")
    .map((route) => ({
      handler: route.handler,
      method: route.method.toLowerCase(),
      path: route.path,
    }))

  Object.entries(schemas).forEach(([key, schema]) => {
    if (schema instanceof z.ZodType) {
      openApiDocument.components.schemas[key] = schema.openapi(key)
    }
  })

  routes.forEach((route) => {
    const { handler, method, path } = route

    if (!openApiDocument.paths[path]) {
      openApiDocument.paths[path] = {}
    }

    const routeConfig = (handler as any).openAPIConfig

    if (routeConfig) {
      openApiDocument.paths[path][method] = {
        responses: routeConfig.responses,
        summary: routeConfig.summary,
        tags: routeConfig.tags,
      }

      if (routeConfig.request) {
        openApiDocument.paths[path][method].parameters = []
        if (routeConfig.request.params) {
          Object.entries(routeConfig.request.params.shape).forEach(
            ([name, schema]) => {
              openApiDocument.paths[path][method].parameters.push({
                in: "path",
                name,
                required: true,
                schema: (schema as z.ZodType).openapi({}),
              })
            },
          )
        }
        if (routeConfig.request.body) {
          openApiDocument.paths[path][method].requestBody =
            routeConfig.request.body
        }
      }
    }
  })

  return openApiDocument
})

const cleanSchema = app.getOpenAPIDocument({
  info: {
    license: { name: "" },
    title: "Problem and Submission API",
    version: "0.1.0",
  },
  openapi: "3.1.0",
  servers: [],
})

const reorderedSchema = {
  components: cleanSchema.components,
  info: cleanSchema.info,
  openapi: cleanSchema.openapi,
  paths: cleanSchema.paths,
}

fs.writeFileSync(
  "../generated/openapi/schema.json",
  JSON.stringify(reorderedSchema, null, 2),
)

console.log(
  "Clean OpenAPI schema with reordered properties has been written to schema.json",
)
