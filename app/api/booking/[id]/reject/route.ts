import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/utils"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const bookingId = params.id

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
      return NextResponse.json({ error: "Solo se pueden rechazar reservas pendientes" }, { status: 400 })
    }

    // Actualizar el estado de la reserva
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    })

    // Crear notificación para el inquilino
    await prisma.notification.create({
      data: {
        userId: booking.borrowerId,
        type: "BOOKING_CANCELLED",
        content: `Tu reserva para "${booking.item.title}" ha sido rechazada`,
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error rejecting booking:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
