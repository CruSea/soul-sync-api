/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `AccountUser` table. All the data in the column will be lost.
  - You are about to drop the column `configuration` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mentor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Thread` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_channelId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_mentorId_fkey";

-- DropForeignKey
ALTER TABLE "Mentor" DROP CONSTRAINT "Mentor_userId_fkey";

-- DropForeignKey
ALTER TABLE "Thread" DROP CONSTRAINT "Thread_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Thread" DROP CONSTRAINT "Thread_messageId_fkey";

-- AlterTable
ALTER TABLE "AccountUser" DROP COLUMN "isDeleted";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "configuration",
DROP COLUMN "isDeleted",
DROP COLUMN "metadata";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isDeleted",
DROP COLUMN "type";

-- DropTable
DROP TABLE "Conversation";

-- DropTable
DROP TABLE "Mentor";

-- DropTable
DROP TABLE "Thread";
