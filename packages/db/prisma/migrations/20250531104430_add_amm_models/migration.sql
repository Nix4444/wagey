/*
  Warnings:

  - You are about to alter the column `priceYes` on the `Events` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Decimal(4,2)`.
  - You are about to alter the column `priceNo` on the `Events` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Decimal(4,2)`.

*/
-- AlterTable
ALTER TABLE "Events" ALTER COLUMN "priceYes" SET DATA TYPE DECIMAL(4,2),
ALTER COLUMN "priceNo" SET DATA TYPE DECIMAL(4,2);

-- CreateTable
CREATE TABLE "LiquidityPool" (
    "eventId" TEXT NOT NULL,
    "yesTokens" INTEGER NOT NULL,
    "noTokens" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "UserPosition" (
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "yesTokens" INTEGER NOT NULL DEFAULT 0,
    "noTokens" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "probability" DECIMAL(3,2) NOT NULL,
    "yesTokens" INTEGER NOT NULL,
    "noTokens" INTEGER NOT NULL,
    "volume" DECIMAL(15,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interval" TEXT NOT NULL,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiquidityPool_eventId_key" ON "LiquidityPool"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPosition_userId_eventId_key" ON "UserPosition"("userId", "eventId");

-- CreateIndex
CREATE INDEX "PriceHistory_eventId_timestamp_idx" ON "PriceHistory"("eventId", "timestamp");

-- AddForeignKey
ALTER TABLE "LiquidityPool" ADD CONSTRAINT "LiquidityPool_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPosition" ADD CONSTRAINT "UserPosition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPosition" ADD CONSTRAINT "UserPosition_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
