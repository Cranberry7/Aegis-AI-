-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "sourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
