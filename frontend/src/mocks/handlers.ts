import { BACKEND_URL } from "@/lib/api"
import { fromOpenApi } from "@mswjs/source/open-api"
import api from "openapi/schema.json"

// @ts-expect-error why type error?
export const handlers = await fromOpenApi({
  basePath: BACKEND_URL,
  ...api,
})
