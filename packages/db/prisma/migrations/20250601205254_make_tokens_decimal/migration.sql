/*
  Warnings:

  - You are about to alter the column `yesTokens` on the `PriceHistory` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(15,6)`.
  - You are about to alter the column `noTokens` on the `PriceHistory` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(15,6)`.
  - You are about to alter the column `yesTokens` on the `UserPosition` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(15,6)`.
  - You are about to alter the column `noTokens` on the `UserPosition` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(15,6)`.

*/
-- AlterTable
ALTER TABLE "PriceHistory" ALTER COLUMN "yesTokens" SET DEFAULT 0,
ALTER COLUMN "yesTokens" SET DATA TYPE DECIMAL(15,6),
ALTER COLUMN "noTokens" SET DEFAULT 0,
ALTER COLUMN "noTokens" SET DATA TYPE DECIMAL(15,6);

-- AlterTable
ALTER TABLE "UserPosition" ALTER COLUMN "yesTokens" SET DEFAULT 0,
ALTER COLUMN "yesTokens" SET DATA TYPE DECIMAL(15,6),
ALTER COLUMN "noTokens" SET DEFAULT 0,
ALTER COLUMN "noTokens" SET DATA TYPE DECIMAL(15,6);
