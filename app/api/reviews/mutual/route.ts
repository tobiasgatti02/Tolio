import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/utils"

// Crear review mutuo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, revieweeId, rating, comment, trustFactors } = body

    // Verificar que el usuario esté autorizado para esta reserva
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        item: true,
        borrower: true,
        owner: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    // Verificar que el usuario sea parte de la reserva
    const userId = session.user.id
    if (booking.borrowerId !== userId && booking.item.ownerId !== userId) {
      return NextResponse.json({ error: "No autorizado para esta reserva" }, { status: 403 })
    }

    // Verificar que la reserva esté completada
    if (booking.status !== "COMPLETED") {
      return NextResponse.json({ error: "La reserva debe estar completada" }, { status: 400 })
    }

    // Verificar que no exista ya una review de este usuario para esta reserva
    const existingReview = await prisma.review.findFirst({
      where: {
        bookingId,
        reviewerId: userId,
      }
    })

    if (existingReview) {
      return NextResponse.json({ error: "Ya has dejado una reseña para esta reserva" }, { status: 400 })
    }

    // Crear la review
    const review = await prisma.review.create({
      data: {
        bookingId,
        itemId: booking.item.id,
        reviewerId: userId,
        revieweeId,
        rating,
        comment: comment || "",
        createdAt: new Date(),
      }
    })

    // Obtener el nombre del reviewer para las notificaciones
    const reviewer = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
    })

    // Crear notificación para el usuario que recibe la review
    await prisma.notification.create({
      data: {
        userId: revieweeId,
        type: "REVIEW_RECEIVED",
        title: "Nueva reseña recibida",
        content: `${reviewer?.firstName} ${reviewer?.lastName} te ha dejado una reseña de ${rating} estrellas`,
      }
    })

    // Verificar si ambos usuarios han dejado reseña para enviar notificación de completar review mutuo
    const otherReview = await prisma.review.findFirst({
      where: {
        bookingId,
        reviewerId: revieweeId,
        revieweeId: userId,
      }
    })

    if (!otherReview) {
      // Enviar notificación al otro usuario para que deje su reseña
      await prisma.notification.create({
        data: {
          userId: revieweeId,
          type: "MESSAGE_RECEIVED", // Usamos este tipo existente por ahora
          title: "Es tu turno de evaluar",
          content: `${reviewer?.firstName} ya dejó su reseña. ¡Es tu turno de evaluar la experiencia!`,
        }
      })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error("Error creating mutual review:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Verificar si ambos usuarios han dejado review mutuo
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const url = new URL(request.url)
    const bookingId = url.searchParams.get("bookingId")

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId es requerido" }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        item: { include: { owner: true } },
        borrower: true,
      }
    })

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    const userId = session.user.id
    const isOwner = booking.item.ownerId === userId
    const isBorrower = booking.borrowerId === userId

    if (!isOwner && !isBorrower) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Buscar las reviews mutuas
    const reviews = await prisma.review.findMany({
      where: { bookingId },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        },
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        }
      }
    })

    const userReview = reviews.find(r => r.reviewerId === userId)
    const otherReview = reviews.find(r => r.revieweeId === userId)

    return NextResponse.json({
      userHasReviewed: !!userReview,
      otherHasReviewed: !!otherReview,
      userReview,
      otherReview,
      canShowModal: booking.status === "COMPLETED" && !userReview,
    })
  } catch (error) {
    console.error("Error checking mutual reviews:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
