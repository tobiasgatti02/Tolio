import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    // Obtener todas las reseñas de los artículos del usuario
    const reviews = await prisma.review.findMany({
      where: {
        item: {
          ownerId: userId
        }
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        item: {
          select: {
            id: true,
            title: true,
            images: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formatear los datos para el frontend
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      reviewer: {
        name: `${review.reviewer.firstName} ${review.reviewer.lastName}`,
        email: review.reviewer.email,
        avatar: null // Por ahora no tenemos avatares
      },
      item: {
        id: review.item.id,
        title: review.item.title,
        images: review.item.images || []
      },
      createdAt: review.createdAt,
      response: null // Por ahora no hay respuestas implementadas
    }))

    return NextResponse.json(formattedReviews)

  } catch (error) {
    console.error("Error obteniendo reseñas del dashboard:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST para responder a una reseña (función placeholder)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { reviewId, response } = await request.json()
    const userId = session.user.id

    // Verificar que la reseña es de un artículo del usuario
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        item: {
          ownerId: userId
        }
      }
    })

    if (!review) {
      return NextResponse.json({ message: "Reseña no encontrada" }, { status: 404 })
    }

    // Por ahora, simplemente devolver éxito sin guardar la respuesta
    // En el futuro, podrías crear una tabla ReviewResponse
    return NextResponse.json({ 
      message: "Función de respuesta no implementada aún", 
      success: false 
    })

  } catch (error) {
    console.error("Error respondiendo a reseña:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
