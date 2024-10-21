import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const initEnumTables = async () => {
  prisma.testStatus.upsert({
    create: {
      status: "Passed",
    },
    update: {},
    where: { status: "Passed" },
  })
  prisma.testStatus.upsert({
    create: {
      status: "Failed",
    },
    update: {},
    where: { status: "Failed" },
  })

  prisma.submissionStatus.upsert({
    create: {
      status: "Accepted",
    },
    update: {},
    where: { status: "Accepted" },
  })
  prisma.submissionStatus.upsert({
    create: {
      status: "WrongAnswer",
    },
    update: {},
    where: { status: "WrongAnswer" },
  })
  prisma.submissionStatus.upsert({
    create: {
      status: "RuntimeError",
    },
    update: {},
    where: { status: "RuntimeError" },
  })
  prisma.submissionStatus.upsert({
    create: {
      status: "CompileError",
    },
    update: {},
    where: { status: "CompileError" },
  })
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
