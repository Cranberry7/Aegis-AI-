/*
  Warnings:

  - You are about to drop the column `status` on the `Conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "status",
ADD COLUMN     "feedback" TEXT DEFAULT NULL,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "feedbackMessage" TEXT DEFAULT NULL,
ADD COLUMN     "feedbackType" TEXT DEFAULT NULL;
