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

      const isProvider = serviceBooking.providerId === userId
      const isClient = serviceBooking.clientId === userId

      if (!isProvider && !isClient) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }

      // El cliente solo puede cancelar si está pendiente
      if (isClient && serviceBooking.status !== "PENDING") {
        return NextResponse.json({ error: "Solo puedes cancelar reservas pendientes" }, { status: 400 })
      }

      // El proveedor puede cancelar pendientes o confirmadas
      if (isProvider && !["PENDING", "CONFIRMED"].includes(serviceBooking.status)) {
        return NextResponse.json({ error: "No se puede cancelar esta reserva" }, { status: 400 })
      }

      // Actualizar el estado de la reserva de servicio
      const updatedServiceBooking = await prisma.serviceBooking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" }
      })

      // Crear notificación para el otro usuario
      const otherUserId = isProvider ? serviceBooking.clientId : serviceBooking.providerId
      const cancellerName = isProvider 
        ? `${serviceBooking.service.provider.firstName} ${serviceBooking.service.provider.lastName}`.trim()
        : `${serviceBooking.client.firstName} ${serviceBooking.client.lastName}`.trim()

      await createNotification(
        otherUserId,
        'BOOKING_CANCELLED',
        {
          bookingId,
          itemId: serviceBooking.serviceId,
          itemTitle: serviceBooking.service.title,
          ownerName: cancellerName
        }
      )

      return NextResponse.json(updatedServiceBooking)
    }

    // Es un Booking normal (item)
    const isOwner = booking.item.ownerId === userId
    const isBorrower = booking.borrowerId === userId

    if (!isOwner && !isBorrower) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // El borrower solo puede cancelar si está pendiente
    if (isBorrower && booking.status !== "PENDING") {
      return NextResponse.json({ error: "Solo puedes cancelar reservas pendientes" }, { status: 400 })
    }

    // El owner puede cancelar pendientes o confirmadas
    if (isOwner && !["PENDING", "CONFIRMED"].includes(booking.status)) {
      return NextResponse.json({ error: "No se puede cancelar esta reserva" }, { status: 400 })
    }

    // Actualizar el estado de la reserva
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    })

    // Crear notificación para el otro usuario
    const otherUserId = isOwner ? booking.borrowerId : booking.item.ownerId
    const cancellerName = isOwner
      ? `${booking.item.owner.firstName} ${booking.item.owner.lastName}`.trim()
      : `${booking.borrower.firstName} ${booking.borrower.lastName}`.trim()

    await createNotification(
      otherUserId,
      'BOOKING_CANCELLED',
      {
        bookingId,
        itemId: booking.itemId,
        itemTitle: booking.item.title,
        ownerName: cancellerName
      }
    )

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error rejecting booking:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
