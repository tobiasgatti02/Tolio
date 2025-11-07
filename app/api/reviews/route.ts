import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, itemId, revieweeId, rating, comment, trustFactors } = body

    // Verificar que el usuario puede hacer esta review
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        item: true,
        review: true
      }
    })

    if (!booking) {
      return NextResponse.json({ message: "Reserva no encontrada" }, { status: 404 })
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json({ message: "Solo se pueden reseñar reservas completadas" }, { status: 400 })
    }

    if (booking.review) {
      return NextResponse.json({ message: "Ya existe una reseña para esta reserva" }, { status: 400 })
    }

    // Verificar que el usuario es parte de esta reserva
    const userId = session.user.id
    if (booking.borrowerId !== userId && booking.ownerId !== userId) {
      return NextResponse.json({ message: "No autorizado para reseñar esta reserva" }, { status: 403 })
    }

    // Crear la review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        trustFactors: trustFactors || [],
        reviewerId: userId,
        revieweeId,
        itemId,
        bookingId
      }
    })

    // Actualizar el estado de la reserva para indicar que fue reseñada
    await prisma.booking.update({
      where: { id: bookingId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { message: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
