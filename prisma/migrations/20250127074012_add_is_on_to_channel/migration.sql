-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "is_on" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Mentor" ADD CONSTRAINT "Mentor_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
