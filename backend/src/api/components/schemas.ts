import { z } from "@hono/zod-openapi"

export const SupportedLanguage = z
  .object({
    name: z.string(),
    version: z.string(),
  })
  .openapi("SupportedLanguage")

export const Language = z
  .object({
    id: z.number().int().nonnegative(),
    name: z.string(),
    version: z.string(),
  })
  .openapi("Language")

export const LanguageCreate = Language.omit({ id: true }).openapi(
  "LanguageCreate",
)

export const LanguageUpdate = Language.openapi("LanguageUpdate")

export const TestCase = z
  .object({
    id: z.number().int().nonnegative(),
    input: z.string(),
    output: z.string(),
  })
  .openapi("TestCase")

export const TestCaseCreate = TestCase.omit({ id: true }).openapi(
  "TestCaseCreate",
)

export const TestCaseUpdate = TestCase.partial({
  input: true,
  output: true,
}).openapi("TestCaseUpdate")

export const Problem = z
  .object({
    body: z.string(),
    id: z.number().int().nonnegative(),
    supported_languages: z.array(Language),
    test_cases: z.array(TestCase),
    title: z.string(),
  })
  .openapi("Problem")

export const ProblemCreate = Problem.omit({ id: true })
  .merge(
    z.object({
      supported_languages: z.array(LanguageCreate),
      test_cases: z.array(TestCaseCreate),
    } satisfies Partial<Record<keyof z.infer<typeof Problem>, unknown>>),
  )
  .openapi("ProblemCreate")

export const ProblemUpdate = Problem.omit({ id: true })
  .merge(
    z.object({
      supported_languages: z.array(LanguageUpdate),
      test_cases: z.array(TestCaseUpdate),
    } satisfies Partial<Record<keyof z.infer<typeof Problem>, unknown>>),
  )
  .partial()
  .openapi("ProblemUpdate")

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
    language: SupportedLanguage,
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
