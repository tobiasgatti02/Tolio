import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"



export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    // Obtener notificaciones del usuario
    const notifications = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limitar a las últimas 10 notificaciones
    })

    // Transformar las notificaciones para el frontend
    const notificationsData = notifications.map(notification => ({
      id: notification.id,
      type: notification.type.toLowerCase(),
      title: getNotificationTitle(notification.type),
      message: notification.content,
      createdAt: notification.createdAt,
      read: notification.isRead,
      actionUrl: getNotificationActionUrl(notification.type, notification.id)
    }))

    return NextResponse.json(notificationsData)

  } catch (error) {
    console.error("Error obteniendo notificaciones del dashboard:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Marcar notificación como leída
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { notificationId } = await request.json()

    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error marcando notificación como leída:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case 'BOOKING_REQUEST':
      return 'Nueva solicitud de reserva'
    case 'BOOKING_CONFIRMED':
      return 'Reserva confirmada'
    case 'BOOKING_CANCELLED':
      return 'Reserva cancelada'
    case 'PAYMENT_RECEIVED':
      return 'Pago recibido'
    case 'PAYMENT_PENDING':
      return 'Pago pendiente'
    case 'NEW_REVIEW':
      return 'Nueva reseña'
    case 'NEW_MESSAGE':
      return 'Nuevo mensaje'
    default:
      return 'Notificación'
  }
}

function getNotificationActionUrl(type: string, notificationId: string): string | undefined {
  switch (type) {
    case 'BOOKING_REQUEST':
    case 'BOOKING_CONFIRMED':
    case 'BOOKING_CANCELLED':
      return '/dashboard/bookings'
    case 'PAYMENT_RECEIVED':
    case 'PAYMENT_PENDING':
      return '/dashboard/bookings'
    case 'NEW_REVIEW':
      return '/dashboard/reviews'
    case 'NEW_MESSAGE':
      return '/dashboard/messages'
    default:
      return undefined
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
