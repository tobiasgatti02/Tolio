import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"
import { createNotification } from "@/lib/notification-helpers"
import { v4 as uuidv4 } from "uuid"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: bookingId } = await params
    const userId = session.user.id

    // Primero buscar en reservas de items
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Item: {
          include: { User: true }
        },
        User_Booking_borrowerIdToUser: true
      }
    })

    if (booking) {
      // Verificar autorización - solo el owner puede completar
      if (booking.Item.ownerId !== userId) {
        return NextResponse.json({ error: "Solo el prestador puede completar la reserva" }, { status: 403 })
      }

      if (booking.status !== "CONFIRMED") {
        return NextResponse.json({ error: "Solo se pueden completar reservas confirmadas" }, { status: 400 })
      }

      // Actualizar el estado de la reserva
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED" }
      })

      // Crear notificación para el otro usuario
      const otherUserId = booking.Item.ownerId === userId ? booking.borrowerId : booking.Item.ownerId

      await createNotification(
        otherUserId,
        'BOOKING_COMPLETED',
        {
          bookingId,
          itemId: booking.itemId,
          itemTitle: booking.Item.title
        }
      )

      return NextResponse.json(updatedBooking)
    }

    // Si no se encuentra, buscar en reservas de servicios
    const serviceBooking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: {
        Service: {
          include: { User: true }
        },
        User_ServiceBooking_clientIdToUser: true
      }
    })

    if (!serviceBooking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    // Verificar autorización - solo el provider puede completar
    if (serviceBooking.providerId !== userId) {
      return NextResponse.json({ error: "Solo el prestador puede completar la reserva" }, { status: 403 })
    }

    if (serviceBooking.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Solo se pueden completar reservas confirmadas" }, { status: 400 })
    }

    // Actualizar el estado de la reserva de servicio
    const updatedServiceBooking = await prisma.serviceBooking.update({
      where: { id: bookingId },
      data: { status: "COMPLETED" }
    })

    // Crear notificación para el cliente
    await createNotification(
      serviceBooking.clientId,
      'BOOKING_COMPLETED',
      {
        bookingId,
        itemId: serviceBooking.serviceId,
        itemTitle: serviceBooking.Service.title
      }
    )

    // Calcular el precio del servicio
    const pricePerHour = serviceBooking.Service.pricePerHour || 0
    let totalPrice = serviceBooking.customPrice || 0
    if (!totalPrice) {
      if (serviceBooking.Service.priceType === 'hour' && serviceBooking.hours) {
        totalPrice = pricePerHour * serviceBooking.hours
      } else {
        totalPrice = pricePerHour
      }
    }

    // Enviar mensaje de solicitud de pago al chat
    if (totalPrice > 0) {
      const paymentRequestContent = JSON.stringify({
        type: 'service_payment_request',
        serviceTitle: serviceBooking.Service.title,
        amount: totalPrice,
        bookingId: bookingId,
        isPaid: false
      })

      await prisma.message.create({
        data: {
          id: uuidv4(),
          content: paymentRequestContent,
          senderId: serviceBooking.providerId,
          receiverId: serviceBooking.clientId,
          bookingId: bookingId,
          isRead: false
        }
      })
    }

    return NextResponse.json(updatedServiceBooking)
  } catch (error) {
    console.error("Error completing booking:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
