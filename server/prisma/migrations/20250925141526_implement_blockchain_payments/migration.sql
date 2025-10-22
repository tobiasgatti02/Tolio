/*
  Warnings:

  - You are about to drop the column `mercadopagoPaymentId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `mercadopagoStatus` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `mercadopagoStatusDetail` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentId` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionHash]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[walletAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Payment_mercadopagoPaymentId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "mercadopagoPaymentId",
DROP COLUMN "mercadopagoStatus",
DROP COLUMN "mercadopagoStatusDetail",
DROP COLUMN "paymentMethod",
DROP COLUMN "stripePaymentId",
ADD COLUMN     "blockNumber" BIGINT,
ADD COLUMN     "contractAddress" TEXT,
ADD COLUMN     "escrowId" TEXT,
ADD COLUMN     "gasFee" DOUBLE PRECISION,
ADD COLUMN     "gasUsed" BIGINT,
ADD COLUMN     "networkId" INTEGER,
ADD COLUMN     "tokenAddress" TEXT,
ADD COLUMN     "transactionHash" TEXT,
ADD COLUMN     "walletAddress" TEXT,
ALTER COLUMN "paymentProvider" SET DEFAULT 'blockchain';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "networkId" INTEGER,
ADD COLUMN     "preferredToken" TEXT,
ADD COLUMN     "walletAddress" TEXT,
ADD COLUMN     "walletConnected" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionHash_key" ON "Payment"("transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");
