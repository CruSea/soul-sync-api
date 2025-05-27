/*
  Warnings:

  - The `expertise` column on the `Mentor` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Mentor" DROP COLUMN "expertise",
ADD COLUMN     "expertise" JSONB;
