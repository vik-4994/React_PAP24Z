/*
  Warnings:

  - A unique constraint covering the columns `[subjectName,student1Id,student2Id,groupFrom1,groupTo1,groupFrom2,groupTo2,completed]` on the table `AcceptedExchange` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "unique_accepted_exchange" ON "AcceptedExchange"("subjectName", "student1Id", "student2Id", "groupFrom1", "groupTo1", "groupFrom2", "groupTo2", "completed");
