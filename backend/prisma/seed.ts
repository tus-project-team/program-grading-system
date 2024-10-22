import { PrismaClient } from "@prisma/client"

import { SubmissionStatus, TestStatus } from "../src/api/components/schemas"

const prisma = new PrismaClient()

const initEnumTables = async () => {
  for (const status of TestStatus._def.values) {
    await prisma.testStatus.upsert({
      create: {
        status,
      },
      update: {},
      where: { status },
    })
  }

  for (const status of SubmissionStatus._def.values) {
    await prisma.submissionStatus.upsert({
      create: {
        status,
      },
      update: {},
      where: { status },
    })
  }
}

const main = async () => {
  await initEnumTables()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
