import { testClient } from "hono/testing"
import { describe, expect, test } from "vitest"

import app, { type AppType } from "./app"

describe("OpenAPI Schema", () => {
  test("GET /api/openapi.json returns the OpenAPI schema", async () => {
    const client = testClient<AppType>(app)
    const res = await client.api["openapi.json"].$get()
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Type")?.split(";")).toContain(
      "application/json",
    )
    expect(await res.json()).not.toBe(null)
  })

  test("GET /api/docs returns the API documentation", async () => {
    const client = testClient<AppType>(app)
    const res = await client.api.docs.$get()
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Type")?.split(";")).toContain("text/html")
    expect(await res.text()).not.toBe(null)
  })
})
