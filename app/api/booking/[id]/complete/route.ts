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

    // Verificar que la reserva existe y el usuario es parte de ella
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        item: { 
          include: { owner: true } 
        },
        borrower: true 
      }
    })

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    const userId = session.user.id
    if (booking.item.ownerId !== userId && booking.borrowerId !== userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (booking.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Solo se pueden completar reservas confirmadas" }, { status: 400 })
    }

    // Actualizar el estado de la reserva
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "COMPLETED" }
    })

    // Crear notificaciones para ambos usuarios
    const otherUserId = booking.item.ownerId === userId ? booking.borrowerId : booking.item.ownerId
    
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: "MESSAGE_RECEIVED", // Usamos este tipo por ahora
        content: `La reserva para "${booking.item.title}" ha sido completada. ¡Deja tu reseña!`,
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error completing booking:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
