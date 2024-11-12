import { testClient } from "hono/testing"
import { describe, expect, test } from "vitest"

import { prisma } from "../../db"
import { createSubmission } from "../../db/test-helpers"
import app from "./submissions"

describe("getSubmissions", () => {
  test("should return a list of submissions", async () => {
    const submission = await prisma.submission.create({
      data: {
        code: "const x = 42",
        language: {
          create: {
            name: "JavaScript",
            version: "ES6",
          },
        },
        problem: {
          create: {
            body: "Write a program that assigns 42 to x",
            title: "Assignment",
          },
        },
        result: {
          create: {
            message: "Success",
            status: {
              connect: {
                status: "Accepted",
              },
            },
          },
        },
        student: {
          create: {
            email: "alice@example.com",
            name: "Alice",
          },
        },
      },
      include: {
        language: true,
        result: {
          include: {
            status: true,
          },
        },
        student: true,
        testResults: {
          include: {
            status: true,
          },
        },
      },
    })
    const submissions = [submission]

    const response = await testClient(app).submissions.$get()
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.length).toBe(submissions.length)
    for (const actual of body) {
      const expected = submissions.find((s) => s.id === actual.id)
      expect(expected).toBeDefined()
      if (expected == null) continue // type guard
      expect(actual.code).toBe(expected.code)
      expect(actual.language.name).toBe(expected.language.name)
      expect(actual.language.version).toBe(expected.language.version)
      expect(actual.problem_id).toBe(expected.problemId)
      expect(actual.result.message).toBe(expected.result.message)
      expect(actual.result.status).toBe(expected.result.status.status)
      expect(actual.student_id).toBe(expected.studentId)
      expect(actual.submitted_at).toBe(expected.createdAt.toISOString())
      expect(actual.test_results.length).toBe(expected.testResults.length)
      for (const testResult of actual.test_results) {
        const expectedTestResult = expected.testResults.find(
          (r) => r.testCaseId === testResult.test_case_id,
        )
        expect(expectedTestResult).toBeDefined()
        if (expectedTestResult == null) continue // type guard
        expect(testResult.message).toBe(expectedTestResult.message)
        expect(testResult.status).toBe(expectedTestResult.status.status)
      }
    }
  })

  test("should return empty list if no submissions", async () => {
    const response = await testClient(app).submissions.$get()
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body).toEqual([])
  })
})

describe("getSubmissionById", () => {
  test("should return a submission by id", async () => {
    const submission = await createSubmission()

    const response = await testClient(app).submissions[":submissionId"].$get({
      param: {
        submissionId: submission.id.toString(),
      },
    })
    expect(response.status).toBe(200)
    if (response.status !== 200) return // type guard

    const body = await response.json()
    expect(body.code).toBe(submission.code)
    expect(body.language.name).toBe(submission.languageName)
    expect(body.language.version).toBe(submission.languageVersion)
    expect(body.problem_id).toBe(submission.problemId)
    expect(body.result.message).toBe(submission.result.message)
    expect(body.result.status).toBe(submission.result.status.status)
    expect(body.student_id).toBe(submission.studentId)
    expect(body.submitted_at).toBe(submission.createdAt.toISOString())
    expect(body.test_results.length).toBe(submission.testResults.length)
    for (const testResult of body.test_results) {
      const expectedTestResult = submission.testResults.find(
        (r) => r.testCaseId === testResult.test_case_id,
      )
      expect(expectedTestResult).toBeDefined()
      if (expectedTestResult == null) continue
      expect(testResult.message).toBe(expectedTestResult.message)
      expect(testResult.status).toBe(expectedTestResult.status.status)
    }
  })

  test("should return 404 if submission does not exist", async () => {
    const response = await testClient(app).submissions[":submissionId"].$get({
      param: {
        submissionId: "1",
      },
    })
    expect(response.status).toBe(404)
  })
})
