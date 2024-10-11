import type { paths } from "openapi/schema"

import createFetchClient from "openapi-fetch"
import createQueryClient from "openapi-react-query"

export const BACKEND_URL: string =
  import.meta.env.BACKEND_URL ?? "http://localhost:5016"

export const client = createFetchClient<paths>({
  baseUrl: BACKEND_URL,
})

export const $api = createQueryClient(client)
