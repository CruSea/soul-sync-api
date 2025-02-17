/*
  Warnings:

  - You are about to drop the column `is_on` on the `Channel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "is_on",
ADD COLUMN     "isOn" BOOLEAN NOT NULL DEFAULT false;
