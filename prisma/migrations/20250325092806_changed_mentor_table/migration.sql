/*
  Warnings:

  - The `expertise` column on the `Mentor` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "isBot" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "expertise",
ADD COLUMN     "expertise" TEXT[] DEFAULT ARRAY[]::TEXT[];
