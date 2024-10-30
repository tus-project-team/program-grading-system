import { describe, expect, test } from "vitest"

import app from "./app"

describe("OpenAPI Schema", () => {
  test("GET /api/openapi.json returns the OpenAPI schema", async () => {
    const res = await app.request("/api/openapi.json")
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Type")?.split(";")).toContain(
      "application/json",
    )
    expect(await res.json()).not.toBe(null)
  })

  test("GET /api/docs returns the API documentation", async () => {
    const res = await app.request("/api/docs")
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Type")?.split(";")).toContain("text/html")
    expect(await res.text()).not.toBe(null)
  })
})
