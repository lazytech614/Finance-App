/*
  Warnings:

  - You are about to drop the column `nextRecuringDate` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `recuringInterval` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "nextRecuringDate",
DROP COLUMN "recuringInterval",
ADD COLUMN     "nextRecurringDate" TIMESTAMP(3),
ADD COLUMN     "recurringInterval" "RecuringInterval";
