/*
  Warnings:

  - The values [GUEST] on the enum `RoleType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `metadata` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AccountUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `menteeId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Mentor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('SENT', 'RECEIVED');

-- AlterEnum
BEGIN;
CREATE TYPE "RoleType_new" AS ENUM ('OWNER', 'ADMIN', 'MENTOR', 'MENTEE');
ALTER TABLE "Role" ALTER COLUMN "type" TYPE "RoleType_new" USING ("type"::text::"RoleType_new");
ALTER TYPE "RoleType" RENAME TO "RoleType_old";
ALTER TYPE "RoleType_new" RENAME TO "RoleType";
DROP TYPE "RoleType_old";
COMMIT;

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "AccountUser" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "metadata",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "address",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "menteeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "isActive" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "address",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "senderId" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "MessageType" NOT NULL,
ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "isDefault" SET DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "username" TEXT NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Mentee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Mentee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mentee_userId_key" ON "Mentee"("userId");

-- CreateIndex
CREATE INDEX "Mentee_userId_isDeleted_idx" ON "Mentee"("userId", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE INDEX "Admin_userId_isDeleted_idx" ON "Admin"("userId", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "Account_name_key" ON "Account"("name");

-- CreateIndex
CREATE INDEX "Account_isDeleted_name_idx" ON "Account"("isDeleted", "name");

-- CreateIndex
CREATE INDEX "AccountUser_userId_isDeleted_idx" ON "AccountUser"("userId", "isDeleted");

-- CreateIndex
CREATE INDEX "AccountUser_accountId_isDeleted_idx" ON "AccountUser"("accountId", "isDeleted");

-- CreateIndex
CREATE INDEX "Channel_accountId_isDeleted_idx" ON "Channel"("accountId", "isDeleted");

-- CreateIndex
CREATE INDEX "Conversation_mentorId_menteeId_idx" ON "Conversation"("mentorId", "menteeId");

-- CreateIndex
CREATE INDEX "Mentor_userId_isDeleted_idx" ON "Mentor"("userId", "isDeleted");

-- CreateIndex
CREATE INDEX "Message_channelId_isDeleted_idx" ON "Message"("channelId", "isDeleted");

-- CreateIndex
CREATE INDEX "Message_isDeleted_senderId_idx" ON "Message"("isDeleted", "senderId");

-- CreateIndex
CREATE INDEX "Thread_conversationId_idx" ON "Thread"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_username_isDeleted_idx" ON "User"("username", "isDeleted");

-- AddForeignKey
ALTER TABLE "Mentee" ADD CONSTRAINT "Mentee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "Mentee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
