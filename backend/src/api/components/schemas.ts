import { z } from "@hono/zod-openapi"

export const Language = z
  .object({
    name: z.string(),
    version: z.string(),
  })
  .openapi("Language")

export const TestCase = z
  .object({
    input: z.string(),
    output: z.string(),
  })
  .openapi("TestCase")

export const Problem = z
  .object({
    body: z.string(),
    id: z.number().int().nonnegative(),
    inputConditions: z.string().nullable(),
    outputConditions: z.string().nullable(),
    supported_languages: z.array(Language),
    test_cases: z.array(TestCase),
    title: z.string(),
    usePropertyBasedTesting: z.boolean(),
  })
  .openapi("Problem")

export const ProblemCreate = Problem.omit({ id: true }).openapi("ProblemCreate")

export const ProblemUpdate = Problem.omit({ id: true }).openapi("ProblemUpdate")

export const SubmissionStatus = z
  .enum(["Accepted", "WrongAnswer", "RuntimeError", "CompileError"])
  .openapi("SubmissionStatus")

export const TestStatus = z.enum(["Passed", "Failed"]).openapi("TestStatus")

export const SubmissionResult = z
  .object({
    message: z.string().optional(),
    status: SubmissionStatus,
  })
  .openapi("SubmissionResult")

export const TestResult = z
  .object({
    message: z.string().optional(),
    status: TestStatus,
    test_case_id: z.number().int().nonnegative(),
  })
  .openapi("TestResult")

export const Submission = z
  .object({
    code: z.string(),
    id: z.number().int().nonnegative(),
    language: Language,
    problem_id: z.number().int().nonnegative(),
    result: SubmissionResult,
    student_id: z.number().int().nonnegative(),
    submitted_at: z.string().datetime(),
    test_results: z.array(TestResult),
  })
  .openapi("Submission")

export const SubmissionCreate = Submission.omit({
  id: true,
  problem_id: true,
  result: true,
  student_id: true,
  submitted_at: true,
  test_results: true,
}).openapi("SubmissionCreate")
