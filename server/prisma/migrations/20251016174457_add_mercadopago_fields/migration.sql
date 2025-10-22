/*
  Warnings:

  - A unique constraint covering the columns `[mercadopagoPaymentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'BOOKING_COMPLETED';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "mercadopagoPaymentId" TEXT,
ADD COLUMN     "mercadopagoPreferenceId" TEXT,
ADD COLUMN     "mercadopagoStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mercadopagoPaymentId_key" ON "Payment"("mercadopagoPaymentId");
