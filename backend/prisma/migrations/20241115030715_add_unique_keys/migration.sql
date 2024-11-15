/*
  Warnings:

  - A unique constraint covering the columns `[input,output,problemId]` on the table `TestCase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[testCaseId,submissionId]` on the table `TestResult` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TestCase_input_output_problemId_key" ON "TestCase"("input", "output", "problemId");

-- CreateIndex
CREATE UNIQUE INDEX "TestResult_testCaseId_submissionId_key" ON "TestResult"("testCaseId", "submissionId");
