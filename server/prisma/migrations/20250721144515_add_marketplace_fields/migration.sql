-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "marketplaceAmount" DOUBLE PRECISION,
ADD COLUMN     "marketplaceFee" DOUBLE PRECISION,
ADD COLUMN     "ownerAmount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "marketplaceAccessToken" TEXT,
ADD COLUMN     "marketplaceConnectedAt" TIMESTAMP(3),
ADD COLUMN     "marketplaceRefreshToken" TEXT,
ADD COLUMN     "marketplaceUserId" TEXT;
