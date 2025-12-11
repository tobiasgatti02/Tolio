import prisma from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export type NotificationType =
    | 'BOOKING_REQUEST'
    | 'BOOKING_CONFIRMED'
    | 'BOOKING_CANCELLED'
    | 'BOOKING_COMPLETED'
    | 'PAYMENT_RECEIVED'
    | 'REVIEW_RECEIVED'
    | 'MESSAGE_RECEIVED'

interface NotificationMetadata {
    bookingId?: string
    itemId?: string
    itemTitle?: string
    ownerName?: string
    borrowerName?: string
    reviewId?: string
    messageId?: string
    [key: string]: any
}

/**
 * Genera la URL de acción apropiada según el tipo de notificación
 */
export function getNotificationActionUrl(
    type: NotificationType,
    metadata: NotificationMetadata
): string {
    switch (type) {
        case 'BOOKING_REQUEST':
            // El propietario debe ver las reservas recibidas
            return '/dashboard/bookings?tab=received'

        case 'BOOKING_CONFIRMED':
        case 'BOOKING_CANCELLED':
            // El usuario debe ver sus reservas
            return metadata.bookingId
                ? `/dashboard/bookings?highlight=${metadata.bookingId}`
                : '/dashboard/bookings'

        case 'BOOKING_COMPLETED':
            // Redirigir a bookings con opción de dejar review
            return metadata.bookingId
                ? `/dashboard/bookings?highlight=${metadata.bookingId}&review=true`
                : '/dashboard/bookings'

        case 'REVIEW_RECEIVED':
            // Ver las reviews recibidas
            return '/dashboard/reviews'

        case 'PAYMENT_RECEIVED':
            // Ver el panel de ganancias
            return '/dashboard?tab=earnings'

        case 'MESSAGE_RECEIVED':
            // Ir a mensajes (si existe la ruta, sino dashboard)
            return metadata.messageId
                ? `/messages?id=${metadata.messageId}`
                : '/dashboard'

        default:
            return '/dashboard'
    }
}

/**
 * Genera el título de la notificación según el tipo
 */
export function getNotificationTitle(
    type: NotificationType,
    metadata: NotificationMetadata
): string {
    switch (type) {
        case 'BOOKING_REQUEST':
            return 'Nueva reserva confirmada'

        case 'BOOKING_CONFIRMED':
            return 'Reserva confirmada'

        case 'BOOKING_CANCELLED':
            return 'Reserva cancelada'

        case 'BOOKING_COMPLETED':
            return 'Reserva completada'

        case 'PAYMENT_RECEIVED':
            return 'Pago recibido'

        case 'REVIEW_RECEIVED':
            return 'Nueva reseña recibida'

        case 'MESSAGE_RECEIVED':
            return 'Nuevo mensaje'

        default:
            return 'Nueva notificación'
    }
}

/**
 * Genera el contenido de la notificación según el tipo
 */
export function getNotificationContent(
    type: NotificationType,
    metadata: NotificationMetadata
): string {
    switch (type) {
        case 'BOOKING_REQUEST':
            return metadata.borrowerName && metadata.itemTitle
                ? `${metadata.borrowerName} quiere reservar "${metadata.itemTitle}"`
                : 'Tienes una nueva solicitud de reserva'

        case 'BOOKING_CONFIRMED':
            return metadata.itemTitle
                ? `Tu reserva para "${metadata.itemTitle}" ha sido confirmada`
                : 'Tu reserva ha sido confirmada'

        case 'BOOKING_CANCELLED':
            return metadata.itemTitle
                ? `La reserva de "${metadata.itemTitle}" ha sido cancelada`
                : 'Una reserva ha sido cancelada'

        case 'BOOKING_COMPLETED':
            return metadata.itemTitle
                ? `La reserva de "${metadata.itemTitle}" se ha completado. ¡Deja una reseña!`
                : 'Una reserva se ha completado'

        case 'PAYMENT_RECEIVED':
            return metadata.amount
                ? `Has recibido un pago de $${metadata.amount}`
                : 'Has recibido un pago'

        case 'REVIEW_RECEIVED':
            return metadata.itemTitle
                ? `Has recibido una nueva reseña para "${metadata.itemTitle}"`
                : 'Has recibido una nueva reseña'

        case 'MESSAGE_RECEIVED':
            return metadata.senderName
                ? `${metadata.senderName} te ha enviado un mensaje`
                : 'Tienes un nuevo mensaje'

        default:
            return 'Tienes una nueva notificación'
    }
}

/**
 * Crea una notificación con URLs y contenido consistentes
 */
export async function createNotification(
    userId: string,
    type: NotificationType,
    metadata: NotificationMetadata = {}
): Promise<void> {
    try {
        const title = getNotificationTitle(type, metadata)
        const content = getNotificationContent(type, metadata)
        const actionUrl = getNotificationActionUrl(type, metadata)

        await prisma.notification.create({
            data: {
                id: uuidv4(),
                userId,
                type,
                title,
                content,
                actionUrl,
                bookingId: metadata.bookingId,
                itemId: metadata.itemId,
                metadata: metadata as any,
                isRead: false
            }
        })
    } catch (error) {
        console.error('Error creating notification:', error instanceof Error ? error.message : String(error))
        throw error
    }
}
