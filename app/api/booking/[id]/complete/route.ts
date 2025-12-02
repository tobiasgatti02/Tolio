import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/utils"
import { createNotification } from "@/lib/notification-helpers"

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
        item: {
          include: { owner: true }
        },
        borrower: true
      }
    })

    if (booking) {
      // Verificar autorización - solo el owner puede completar
      if (booking.item.ownerId !== userId) {
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
      const otherUserId = booking.item.ownerId === userId ? booking.borrowerId : booking.item.ownerId

      await createNotification(
        otherUserId,
        'BOOKING_COMPLETED',
        {
          bookingId,
          itemId: booking.itemId,
          itemTitle: booking.item.title
        }
      )

      return NextResponse.json(updatedBooking)
    }

    // Si no se encuentra, buscar en reservas de servicios
    const serviceBooking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          include: { provider: true }
        },
        client: true
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

    // Crear notificación para el otro usuario
    const otherUserId = serviceBooking.providerId === userId ? serviceBooking.clientId : serviceBooking.providerId

    await createNotification(
      otherUserId,
      'BOOKING_COMPLETED',
      {
        bookingId,
        itemId: serviceBooking.serviceId,
        itemTitle: serviceBooking.service.title
      }
    )

    return NextResponse.json(updatedServiceBooking)
  } catch (error) {
    console.error("Error completing booking:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
