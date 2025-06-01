-- AlterTable
ALTER TABLE "LiquidityPool" ADD CONSTRAINT "LiquidityPool_pkey" PRIMARY KEY ("eventId");

-- DropIndex
DROP INDEX "LiquidityPool_eventId_key";
