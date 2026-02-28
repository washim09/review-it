/*
  Warnings:

  - Added the required column `recipientId` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- ALTER TABLE "ChatMessage" ADD COLUMN     "recipientId" INTEGER NOT NULL;

-- AddForeignKey
-- ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Add the recipientId column as nullable initially
ALTER TABLE "ChatMessage" ADD COLUMN "recipientId" INTEGER;

-- Update existing rows to set a default recipientId (e.g., 1)
UPDATE "ChatMessage" SET "recipientId" = 1;

-- Make the recipientId column required
ALTER TABLE "ChatMessage" ALTER COLUMN "recipientId" SET NOT NULL;

-- Add the foreign key constraint
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_recipientId_fkey" 
    FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
