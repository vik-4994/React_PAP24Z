/*
  Warnings:

  - You are about to drop the column `studentName` on the `AcceptedExchange` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AcceptedExchange" DROP COLUMN "studentName",
ADD COLUMN     "studentName1" TEXT NOT NULL DEFAULT 'Unknown Student',
ADD COLUMN     "studentName2" TEXT NOT NULL DEFAULT 'Unknown Student';
