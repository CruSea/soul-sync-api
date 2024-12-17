/*
  Warnings:

  - Added the required column `isDeleted` to the `AccountUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `configuration` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isDeleted` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metadata` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isDeleted` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AccountUser" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "configuration" JSONB NOT NULL,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL,
ADD COLUMN     "metadata" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Mentor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expertise" TEXT NOT NULL,
    "availability" JSONB NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "Mentor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mentor_userId_key" ON "Mentor"("userId");

-- AddForeignKey
ALTER TABLE "Mentor" ADD CONSTRAINT "Mentor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
