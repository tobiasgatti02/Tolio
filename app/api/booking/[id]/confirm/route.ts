import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"
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
        Item: {
          include: { User: true }
        },
        User_Booking_borrowerIdToUser: true
      }
    })

    // Si no se encuentra, buscar en ServiceBooking
    if (!booking) {
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

      // Verificar que el usuario es el proveedor del servicio
      if (serviceBooking.Service.providerId !== session.user.id) {
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
          itemTitle: serviceBooking.Service.title,
          ownerName: `${serviceBooking.Service.User.firstName} ${serviceBooking.Service.User.lastName}`.trim()
        }
      )

      return NextResponse.json({
        ...updatedServiceBooking,
        mayIncludeMaterials: serviceBooking.Service.mayIncludeMaterials,
        serviceTitle: serviceBooking.Service.title,
        clientId: serviceBooking.clientId
      })
    }

    // Es un Booking normal (item)
    if (booking.Item.ownerId !== session.user.id) {
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
        itemTitle: booking.Item.title,
        ownerName: `${booking.Item.User.firstName} ${booking.Item.User.lastName}`.trim()
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
