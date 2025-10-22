/*
  Warnings:

  - You are about to drop the column `blockNumber` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `contractAddress` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `escrowId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `gasFee` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `gasUsed` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `networkId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `tokenAddress` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `transactionHash` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `walletAddress` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `networkId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `walletAddress` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `walletConnected` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeAccountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Payment_transactionHash_key";

-- DropIndex
DROP INDEX "User_walletAddress_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "blockNumber",
DROP COLUMN "contractAddress",
DROP COLUMN "escrowId",
DROP COLUMN "gasFee",
DROP COLUMN "gasUsed",
DROP COLUMN "networkId",
DROP COLUMN "tokenAddress",
DROP COLUMN "transactionHash",
DROP COLUMN "walletAddress",
ADD COLUMN     "capturedAt" TIMESTAMP(3),
ADD COLUMN     "refundAmount" DOUBLE PRECISION,
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "stripeChargeId" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeTransferId" TEXT,
ALTER COLUMN "paymentProvider" SET DEFAULT 'stripe';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "networkId",
DROP COLUMN "preferredToken",
DROP COLUMN "walletAddress",
DROP COLUMN "walletConnected",
ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeOnboarded" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeAccountId_key" ON "User"("stripeAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
