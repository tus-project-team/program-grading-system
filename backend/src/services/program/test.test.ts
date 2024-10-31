import { describe, expect, test } from "vitest"

import { test as testProgram } from "."

describe("Test program", () => {
  test("Python 3.12 with correct output", async () => {
    const code = `
      name = input()
      print("Hello, " + name)
    `
    const input = "Alice"
    const result = await testProgram({
      code,
      input,
      language: { name: "Python", version: "3.12" },
      output: "Hello, Alice",
    })
    expect(result).toEqual({ status: "Passed" })
  })

  test("Python 3.12 with incorrect output", async () => {
    const code = `
      name = input()
      print("Hello, " + name)
    `
    const input = "Alice"
    const result = await testProgram({
      code,
      input,
      language: { name: "Python", version: "3.12" },
      output: "Hello, Bob",
    })
    expect(result).toEqual({ status: "Failed" })
  })
})
