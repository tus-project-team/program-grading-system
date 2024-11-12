import type { Prisma } from "@prisma/client"

import { faker } from "@faker-js/faker"

import { SubmissionStatus, TestStatus } from "../api/components/schemas"
import { prisma } from "./prisma"

/**
 * Reset the database by deleting all tables except for enum tables
 */
export const resetDb = async () => {
  await prisma.$transaction([
    prisma.submission.deleteMany(),
    prisma.submissionResult.deleteMany(),
    prisma.testResult.deleteMany(),
    prisma.testCase.deleteMany(),
    prisma.problem.deleteMany(),
    prisma.language.deleteMany(),
    prisma.supportedLanguage.deleteMany(),
    prisma.student.deleteMany(),
    prisma.teacher.deleteMany(),
  ])
}

const kebabCase = (str: string) => str.replaceAll(/\s/g, "-").toLowerCase()

/**
 * Create a User data object, but never insert it into the db
 *
 * @param data The data to generate the user with
 * @returns The generated user data
 */
export const createStudentData = ({
  name = faker.person.fullName(),
  email = `${kebabCase(name)}@student.example.com`,
  ...data
}: Partial<Prisma.StudentCreateInput> = {}): Prisma.StudentCreateInput => ({
  email,
  name,
  ...data,
})

/**
 * Create a User
 *
 * @param data The data to create the user with
 * @returns The created user
 * @see {@link createStudentData}
 */
export const createStudent = (data: Partial<Prisma.StudentCreateInput> = {}) =>
  prisma.student.create({
    data: createStudentData(data),
  })

/**
 * Create a Teacher data object, but never insert it into the db
 *
 * @param data The data to generate the teacher with
 * @returns The generated teacher data
 */
export const createTeacherData = ({
  name = faker.person.fullName(),
  email = `${kebabCase(name)}@teacher.example.com`,
  ...data
}: Partial<Prisma.TeacherCreateInput> = {}): Prisma.TeacherCreateInput => ({
  email,
  name,
  ...data,
})

/**
 * Create a Teacher
 *
 * @param data The data to create the teacher with
 * @returns The created teacher
 * @see {@link createTeacherData}
 */
export const createTeacher = (data: Partial<Prisma.TeacherCreateInput> = {}) =>
  prisma.teacher.create({
    data: createTeacherData(data),
  })

/**
 * Create a Problem data object, but never insert it into the db
 *
 * @param data The data to generate the problem with
 * @returns The generated problem data
 */
export const createProblemData = ({
  body = faker.lorem.paragraph(),
  title = faker.book.title(),
  ...data
}: Partial<Prisma.ProblemCreateInput> = {}): Prisma.ProblemCreateInput => ({
  body,
  title,
  ...data,
})

/**
 * Create a Problem
 *
 * @param data The data to create the problem with
 * @returns The created problem
 * @see {@link createProblemData}
 */
export const createProblem = (data: Partial<Prisma.ProblemCreateInput> = {}) =>
  prisma.problem.create({
    data: createProblemData(data),
    include: {
      supportedLanguages: true,
      teachers: true,
      testCases: true,
    },
  })

/**
 * Create a Problem data object, but never insert it into the db
 *
 * @param data The data to generate the problem with
 * @returns The generated problem data
 */
export const createTestCaseData = ({
  input = faker.lorem.sentence(),
  output = faker.lorem.sentence(),
  problem = {
    create: createProblemData(),
  },
  ...data
}: Partial<Prisma.TestCaseCreateInput> = {}): Prisma.TestCaseCreateInput => ({
  input,
  output,
  problem,
  ...data,
})

/**
 * Create a TestCase
 *
 * @param data The data to create the test case with
 * @returns The created test case
 * @see {@link createTestCaseData}
 */
export const createTestCase = (
  data: Partial<Prisma.TestCaseCreateInput> = {},
) =>
  prisma.testCase.create({
    data: createTestCaseData(data),
  })

/**
 * Create a TestResult data object, but never insert it into the db
 *
 * @param data The data to generate the test result with
 * @returns The generated test result data
 */
export const createTestResultData = ({
  message = faker.lorem.sentence(),
  status = {
    connect: {
      status: faker.helpers.arrayElement(TestStatus._def.values),
    },
  },
  testCase = {
    create: createTestCaseData(),
  },
  ...data
}: Partial<Prisma.TestResultCreateInput> = {}): Prisma.TestResultCreateInput => ({
  message,
  status,
  testCase,
  ...data,
})

/**
 * Create a TestResult
 *
 * @param data The data to create the test result with
 * @returns The created test result
 * @see {@link createTestResultData}
 */
export const createTestResult = (
  data: Partial<Prisma.TestResultCreateInput> = {},
) =>
  prisma.testResult.create({
    data: createTestResultData(data),
  })

const upperCaseFirst = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Create a SupportedLanguage data object, but never insert it into the db
 *
 * @param data The data to generate the supported language with
 * @returns The generated supported language data
 */
export const createSupportedLanguageData = ({
  name = upperCaseFirst(faker.lorem.word()),
  version = faker.system.semver(),
  ...data
}: Partial<Prisma.SupportedLanguageCreateInput> = {}): Prisma.SupportedLanguageCreateInput => ({
  name,
  version,
  ...data,
})

/**
 * Create a SupportedLanguage
 *
 * @param data The data to create the supported language with
 * @returns The created supported language
 * @see {@link createSupportedLanguageData}
 */
export const cerateSupportedLanguage = (
  data: Partial<Prisma.SupportedLanguageCreateInput> = {},
) =>
  prisma.supportedLanguage.create({
    data: createSupportedLanguageData(data),
  })

/**
 * Create a SubmissionResult data object, but never insert it into the db
 *
 * @param data The data to generate the submission result with
 * @returns The generated submission result data
 */
export const createSubmissionResultData = ({
  message = faker.lorem.sentence(),
  status = {
    connect: {
      status: faker.helpers.arrayElement(SubmissionStatus._def.values),
    },
  },
  ...data
}: Partial<Prisma.SubmissionResultCreateInput> = {}): Prisma.SubmissionResultCreateInput => ({
  message,
  status,
  ...data,
})

/**
 * Create a SubmissionResult
 *
 * @param data The data to create the submission result with
 * @returns The created submission result
 * @see {@link createSubmissionResultData}
 */
export const createSubmissionResult = (
  data: Partial<Prisma.SubmissionResultCreateInput> = {},
) =>
  prisma.submissionResult.create({
    data: createSubmissionResultData(data),
    include: {
      status: true,
    },
  })

const createLanguageDataForSubmission =
  (): Prisma.SupportedLanguageCreateNestedOneWithoutSubmissionsInput => {
    const supportedLanguage = createSupportedLanguageData()
    return {
      connectOrCreate: {
        create: supportedLanguage,
        where: {
          name_version: {
            name: supportedLanguage.name,
            version: supportedLanguage.version,
          },
        },
      },
    }
  }

const createStudentDataForSubmission =
  (): Prisma.StudentCreateNestedOneWithoutSubmissionsInput => {
    const student = createStudentData()
    return {
      connectOrCreate: {
        create: student,
        where: {
          email: student.email,
        },
      },
    }
  }

/**
 * Create a Submission data object, but never insert it into the db
 *
 * @param data The data to generate the submission with
 * @returns The generated submission data
 */
export const createSubmissionData = ({
  code = faker.lorem.paragraph(),
  language = createLanguageDataForSubmission(),
  problem = {
    create: createProblemData(),
  },
  result = {
    create: createSubmissionResultData(),
  },
  student = createStudentDataForSubmission(),
  ...data
}: Partial<Prisma.SubmissionCreateInput> = {}): Prisma.SubmissionCreateInput => ({
  code,
  language,
  problem,
  result,
  student,
  ...data,
})

/**
 * Create a Submission
 *
 * @param data The data to create the submission with
 * @returns The created submission
 * @see {@link createSubmissionData}
 */
export const createSubmission = (
  data: Partial<Prisma.SubmissionCreateInput> = {},
) =>
  prisma.submission.create({
    data: createSubmissionData(data),
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
