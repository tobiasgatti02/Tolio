import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/utils"

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

    // Verificar que la reserva existe y el usuario es el propietario
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        item: { 
          include: { owner: true } 
        } 
      }
    })

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

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

    // Crear notificación para el inquilino
    await prisma.notification.create({
      data: {
        userId: booking.borrowerId,
        type: "BOOKING_CONFIRMED",
        title: "Reserva confirmada",
        content: `Tu reserva para "${booking.item.title}" ha sido confirmada`,
        bookingId: bookingId,
        itemId: booking.itemId,
        actionUrl: `/dashboard/bookings/${bookingId}`,
        metadata: {
          bookingId,
          itemTitle: booking.item.title,
          ownerName: booking.item.owner.firstName + ' ' + booking.item.owner.lastName
        }
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error confirming booking:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
