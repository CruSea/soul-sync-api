-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "embedding" vector(768);

-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "embedding" vector(768);
