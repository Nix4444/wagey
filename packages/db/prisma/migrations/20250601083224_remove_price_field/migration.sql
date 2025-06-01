/*
  Warnings:

  - You are about to drop the column `priceNo` on the `Events` table. All the data in the column will be lost.
  - You are about to drop the column `priceYes` on the `Events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Events" DROP COLUMN "priceNo",
DROP COLUMN "priceYes";
