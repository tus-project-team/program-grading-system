import createClient from "openapi-fetch"
import type { paths } from "openapi/schema"

export const client = createClient<paths>({
  baseUrl:
    process.env.MOCK === "true"
      ? "http://localhost:4010"
      : "http://localhost:5016",
})
