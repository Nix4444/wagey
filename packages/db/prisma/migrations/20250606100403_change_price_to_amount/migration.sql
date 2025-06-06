/*
  Warnings:

  - You are about to drop the column `price` on the `OrderHistory` table. All the data in the column will be lost.
  - Added the required column `amount` to the `OrderHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderHistory" DROP COLUMN "price",
ADD COLUMN     "amount" DECIMAL(15,2) NOT NULL;
