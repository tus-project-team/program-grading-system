import { z } from "@hono/zod-openapi"

export const TestCase = z.object({
  input: z.string(),
  output: z.string(),
})

export const Language = z.object({
  name: z.string(),
  version: z.string(),
})

export const Problem = z.object({
  body: z.string(),
  id: z.number(),
  supported_languages: z.array(Language),
  test_cases: z.array(TestCase),
  title: z.string(),
})

export const ProblemCreate = z.object({
  body: z.string(),
  supported_languages: z.array(Language),
  test_cases: z.array(TestCase),
  title: z.string(),
})

export const ProblemUpdate = z.object({
  body: z.string().optional(),
  supported_languages: z.array(Language).optional(),
  test_cases: z.array(TestCase).optional(),
  title: z.string().optional(),
})

export const SubmissionStatus = z.enum([
  "Accepted",
  "WrongAnswer",
  "RuntimeError",
  "CompileError",
])

export const TestStatus = z.enum(["Passed", "Failed"])

export const SubmissionResult = z.object({
  message: z.string().optional(),
  status: SubmissionStatus,
})

export const TestResult = z.object({
  message: z.string().optional(),
  status: TestStatus,
  test_case_id: z.number(),
})

export const Submission = z.object({
  code: z.string(),
  id: z.number(),
  language: Language,
  problem_id: z.number(),
  result: SubmissionResult,
  student_id: z.number(),
  test_results: z.array(TestResult),
})

export const SubmissionCreate = z.object({
  problem_id: z.number(),
})
