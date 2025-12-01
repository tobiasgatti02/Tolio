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

    // Primero buscar en Booking (items)
    let booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        item: {
          include: { owner: true }
        },
        borrower: true
      }
    })

    // Si no se encuentra, buscar en ServiceBooking
    if (!booking) {
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

      // Verificar que el usuario es el proveedor del servicio
      if (serviceBooking.service.providerId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }

      if (serviceBooking.status !== "PENDING") {
        return NextResponse.json({ error: "Solo se pueden confirmar reservas pendientes" }, { status: 400 })
      }

      // Actualizar el estado de la reserva de servicio
      const updatedServiceBooking = await prisma.serviceBooking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" }
      })

      // Crear notificación para el cliente
      await createNotification(
        serviceBooking.clientId,
        'BOOKING_CONFIRMED',
        {
          bookingId,
          itemId: serviceBooking.serviceId,
          itemTitle: serviceBooking.service.title,
          ownerName: `${serviceBooking.service.provider.firstName} ${serviceBooking.service.provider.lastName}`.trim()
        }
      )

      return NextResponse.json(updatedServiceBooking)
    }

    // Es un Booking normal (item)
    if (booking.item.ownerId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json({ error: "Solo se pueden confirmar reservas pendientes" }, { status: 400 })
    }

    // Actualizar el estado de la reserva
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" }
    })

    // Crear notificación para el inquilino usando el helper
    await createNotification(
      booking.borrowerId,
      'BOOKING_CONFIRMED',
      {
        bookingId,
        itemId: booking.itemId,
        itemTitle: booking.item.title,
        ownerName: `${booking.item.owner.firstName} ${booking.item.owner.lastName}`.trim()
      }
    )

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error confirming booking:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
