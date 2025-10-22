/*
  Warnings:

  - A unique constraint covering the columns `[mercadopagoAccessToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mercadopagoAccessToken" TEXT,
ADD COLUMN     "mercadopagoConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mercadopagoConnectedAt" TIMESTAMP(3),
ADD COLUMN     "mercadopagoRefreshToken" TEXT,
ADD COLUMN     "mercadopagoUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_mercadopagoAccessToken_key" ON "User"("mercadopagoAccessToken");
