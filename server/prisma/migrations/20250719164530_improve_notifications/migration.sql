/*
  Warnings:

  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "bookingId" TEXT;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "actionUrl" TEXT,
ADD COLUMN     "bookingId" TEXT,
ADD COLUMN     "itemId" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Notificación';

-- Update existing notifications with a proper title based on their type
UPDATE "Notification" SET "title" = 
  CASE 
    WHEN "type" = 'BOOKING_REQUEST' THEN 'Nueva solicitud de reserva'
    WHEN "type" = 'BOOKING_CONFIRMED' THEN 'Reserva confirmada'
    WHEN "type" = 'BOOKING_CANCELLED' THEN 'Reserva cancelada'
    WHEN "type" = 'PAYMENT_RECEIVED' THEN 'Pago recibido'
    WHEN "type" = 'REVIEW_RECEIVED' THEN 'Nueva reseña recibida'
    WHEN "type" = 'MESSAGE_RECEIVED' THEN 'Nuevo mensaje'
    ELSE 'Notificación'
  END;
