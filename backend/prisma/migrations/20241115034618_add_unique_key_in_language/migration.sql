/*
  Warnings:

  - A unique constraint covering the columns `[languageName,languageVersion,problemId]` on the table `Language` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Language_languageName_languageVersion_problemId_key" ON "Language"("languageName", "languageVersion", "problemId");
