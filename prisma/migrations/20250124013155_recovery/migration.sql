/*
  Warnings:

  - You are about to drop the column `studentName1` on the `AcceptedExchange` table. All the data in the column will be lost.
  - You are about to drop the column `studentName2` on the `AcceptedExchange` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AcceptedExchange" DROP COLUMN "studentName1",
DROP COLUMN "studentName2";
