/*
  Warnings:

  - You are about to drop the column `isRecuring` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "isRecuring",
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false;
