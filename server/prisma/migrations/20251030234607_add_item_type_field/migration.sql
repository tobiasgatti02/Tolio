/*
  Warnings:

  - You are about to drop the column `totalPrice` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `deposit` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('SERVICE', 'TOOL');

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_bookingId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "totalPrice";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "deposit",
DROP COLUMN "price",
ADD COLUMN     "type" "ItemType" NOT NULL DEFAULT 'SERVICE';

-- DropTable
DROP TABLE "Payment";
