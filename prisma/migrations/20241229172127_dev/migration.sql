/*
  Warnings:

  - You are about to drop the column `username` on the `Channel` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Channel_username_isDeleted_idx";

-- DropIndex
DROP INDEX "Channel_username_key";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "username";
