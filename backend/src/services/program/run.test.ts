import { describe, expect, test } from "vitest"

import { run } from "."

describe("Run program", () => {
  test("Python 3.12", async () => {
    const code = `
      name = input()
      print("Hello, " + name)
    `
    const input = "Alice"
    const { stdout } = await run({
      code,
      input,
      language: { name: "Python", version: "3.12" },
    })
    expect(stdout).toBe("Hello, Alice")
  })
})
