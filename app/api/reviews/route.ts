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
    const { bookingId, itemId, serviceId, revieweeId, rating, comment, trustFactors } = body
    const userId = session.user.id

    // Primero buscar en Booking (items)
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        item: true,
        review: true
      }
    })

    if (booking) {
      if (booking.status !== 'COMPLETED') {
        return NextResponse.json({ message: "Solo se pueden reseñar reservas completadas" }, { status: 400 })
      }

      if (booking.review) {
        return NextResponse.json({ message: "Ya existe una reseña para esta reserva" }, { status: 400 })
      }

      // Verificar que el usuario es parte de esta reserva
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
          itemId: booking.itemId,
          bookingId
        }
      })

      return NextResponse.json({ success: true, review })
    }

    // Buscar en ServiceBooking
    const serviceBooking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        review: true
      }
    })

    if (!serviceBooking) {
      return NextResponse.json({ message: "Reserva no encontrada" }, { status: 404 })
    }

    if (serviceBooking.status !== 'COMPLETED') {
      return NextResponse.json({ message: "Solo se pueden reseñar reservas completadas" }, { status: 400 })
    }

    if (serviceBooking.review) {
      return NextResponse.json({ message: "Ya existe una reseña para esta reserva" }, { status: 400 })
    }

    // Verificar que el usuario es parte de esta reserva
    if (serviceBooking.clientId !== userId && serviceBooking.providerId !== userId) {
      return NextResponse.json({ message: "No autorizado para reseñar esta reserva" }, { status: 403 })
    }

    // Crear la review para servicio usando ServiceReview
    const review = await prisma.serviceReview.create({
      data: {
        rating,
        comment,
        reviewerId: userId,
        revieweeId,
        serviceId: serviceBooking.serviceId,
        bookingId
      }
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
