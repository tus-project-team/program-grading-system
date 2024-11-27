import { z } from "@hono/zod-openapi"
import { testClient } from "hono/testing"
import { describe, expect, test } from "vitest"

import { prisma } from "../../db"
import { cerateSupportedLanguage, createProblem } from "../../db/test-helpers"
import { ProblemUpdate } from "../components/schemas"
import app from "./problems"

describe("updateProblem", () => {
  test("should update a problem", async () => {
    const python = await cerateSupportedLanguage({
      name: "Python",
      version: "3.12",
    })
    const javascript = await cerateSupportedLanguage({
      name: "JavaScript",
      version: "ES6",
    })
    const problem = await createProblem()

    const expected: z.infer<typeof ProblemUpdate> = {
      body: "New Body",
      supported_languages: [
        {
          name: python.name,
          version: python.version,
        },
        {
          name: javascript.name,
          version: javascript.version,
        },
      ],
      test_cases: [
        {
          input: "1",
          output: "1",
        },
        {
          input: "2",
          output: "2",
        },
      ],
      title: "New Title",
    }
    const response = await testClient(app).problems[":problemId"].$put({
      json: expected,
      param: {
        problemId: problem.id.toString(),
      },
    })
    expect(response.status).toBe(200)
    if (response.status !== 200) return // type guard

    const actual = await response.json()
    expect(actual).toEqual({
      id: problem.id,
      ...expected,
    } satisfies typeof actual)
  })

  test("should update a problem with empty supported languages", async () => {
    const problem = await createProblem()

    const expected: z.infer<typeof ProblemUpdate> = {
      body: "New Body",
      supported_languages: [],
      test_cases: [],
      title: "New Title",
    }
    const response = await testClient(app).problems[":problemId"].$put({
      json: expected,
      param: {
        problemId: problem.id.toString(),
      },
    })
    expect(response.status).toBe(200)
    if (response.status !== 200) return // type guard

    const actual = await response.json()
    expect(actual).toEqual({
      id: problem.id,
      ...expected,
    } satisfies typeof actual)
  })

  test("should update a problem with empty test cases", async () => {
    const problem = await createProblem()

    const expected: z.infer<typeof ProblemUpdate> = {
      body: "New Body",
      supported_languages: [],
      test_cases: [],
      title: "New Title",
    }
    const response = await testClient(app).problems[":problemId"].$put({
      json: expected,
      param: {
        problemId: problem.id.toString(),
      },
    })
    expect(response.status).toBe(200)
    if (response.status !== 200) return // type guard

    const actual = await response.json()
    expect(actual).toEqual({
      id: problem.id,
      ...expected,
    } satisfies typeof actual)
  })

  test("should update only changed fields", async () => {
    const python = await cerateSupportedLanguage({
      name: "Python",
      version: "3.12",
    })
    const javascript = await cerateSupportedLanguage({
      name: "JavaScript",
      version: "ES6",
    })
    const problem = await createProblem({
      supportedLanguages: {
        create: [
          {
            language: {
              connect: {
                name_version: {
                  name: python.name,
                  version: python.version,
                },
              },
            },
          },
        ],
      },
      testCases: {
        create: [
          {
            input: "1",
            output: "1",
          },
        ],
      },
    })

    const expected: z.infer<typeof ProblemUpdate> = {
      body: "New Body",
      supported_languages: [
        ...problem.supportedLanguages.map(
          ({ languageName: name, languageVersion: version }) => ({
            name,
            version,
          }),
        ),
        {
          name: javascript.name,
          version: javascript.version,
        },
      ],
      test_cases: [
        ...problem.testCases.map(({ input, output }) => ({
          input,
          output,
        })),
        {
          input: "2",
          output: "2",
        },
      ],
      title: "New Title",
    }
    const response = await testClient(app).problems[":problemId"].$put({
      json: expected,
      param: {
        problemId: problem.id.toString(),
      },
    })
    expect(response.status).toBe(200)
    if (response.status !== 200) return // type guard

    const actual = await response.json()
    expect(actual).toEqual({
      id: problem.id,
      ...expected,
    } satisfies typeof actual)

    const updatedProblem = await prisma.problem.findUnique({
      include: {
        supportedLanguages: true,
        testCases: true,
      },
      where: {
        id: problem.id,
      },
    })

    expect(updatedProblem).not.toBeNull()
    if (updatedProblem == null) return // type guard
    expect(updatedProblem.id).toBe(problem.id)
    expect(
      Object.fromEntries(
        Object.entries(
          updatedProblem.supportedLanguages.find(
            ({ id }) => id === problem.supportedLanguages[0].id,
          ) ?? {},
        ).filter(([key]) => key !== "updatedAt"),
      ),
    ).toEqual(
      Object.fromEntries(
        Object.entries(problem.supportedLanguages[0]).filter(
          ([key]) => key !== "updatedAt",
        ),
      ),
    )
    expect(
      Object.fromEntries(
        Object.entries(
          updatedProblem.testCases.find(
            ({ id }) => id === problem.testCases[0].id,
          ) ?? {},
        ).filter(([key]) => key !== "updatedAt"),
      ),
    ).toEqual(
      Object.fromEntries(
        Object.entries(problem.testCases[0]).filter(
          ([key]) => key !== "updatedAt",
        ),
      ),
    )
  })

  test("should return 404 if problem not found", async () => {
    const response = await testClient(app).problems[":problemId"].$put({
      json: {
        body: "New Body",
        supported_languages: [],
        test_cases: [],
        title: "New Title",
      },
      param: {
        problemId: "1",
      },
    })
    expect(response.status).toBe(404)
  })
})

describe("getProblem", () => {
  test("should retrieve a problem by ID", async () => {
    const problem = await createProblem()
    const response = await testClient(app).problems[":problemId"].$get({
      param: {
        problemId: problem.id.toString(),
      },
    })

    expect(response.status).toBe(200)
    if (response.status !== 200) return // type guard

    const actual = await response.json()
    expect(actual).toEqual({
      body: problem.body,
      id: problem.id,
      supported_languages: problem.supportedLanguages.map(({languageName, languageVersion}) => ({
        name: languageName,
        version: languageVersion
      })),
      test_cases: problem.testCases,
      title: problem.title
    } satisfies typeof actual)
  })

  test("should return 404 if problem not found", async () => {
    const problemCount = await prisma.problem.count()
    const response = await testClient(app).problems[":problemId"].$get({
      param: {
        problemId: (problemCount + 1).toString(),
      },
    })
    expect(response.status).toBe(404)
  })
})
