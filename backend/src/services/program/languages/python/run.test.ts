import { describe, expect, test } from "vitest"

import { runPythonCode } from "."

describe("Run Python program", () => {
  test("Run Python code with input", async () => {
    const code = `
      name = input()
      print("Hello, " + name)
    `
    const input = "Alice"
    const { stdout } = await runPythonCode(code, input)
    expect(stdout).toBe("Hello, Alice")
  })
})
