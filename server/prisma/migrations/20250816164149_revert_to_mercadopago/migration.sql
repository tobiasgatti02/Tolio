/*
  Warnings:

  - You are about to drop the column `externalReference` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `preferenceId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `marketplaceAccessToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `marketplaceConnectedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `marketplaceRefreshToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `marketplaceUserId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Payment_preferenceId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "externalReference",
DROP COLUMN "preferenceId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "marketplaceAccessToken",
DROP COLUMN "marketplaceConnectedAt",
DROP COLUMN "marketplaceRefreshToken",
DROP COLUMN "marketplaceUserId";
