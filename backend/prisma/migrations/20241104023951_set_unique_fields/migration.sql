/*
  Warnings:

  - A unique constraint covering the columns `[languageName,languageVersion,problemId]` on the table `Language` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[input,output,problemId]` on the table `TestCase` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Language_languageName_languageVersion_problemId_key" ON "Language"("languageName", "languageVersion", "problemId");

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_input_output_problemId_key" ON "TestCase"("input", "output", "problemId");
