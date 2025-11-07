import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Params {
  reviewId: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { reviewId } = params
    const { response } = await request.json()

    if (!response || typeof response !== 'string' || response.trim().length === 0) {
      return NextResponse.json(
        { error: 'La respuesta es requerida' },
        { status: 400 }
      )
    }

    if (response.length > 500) {
      return NextResponse.json(
        { error: 'La respuesta no puede exceder 500 caracteres' },
        { status: 400 }
      )
    }

    // Verificar que el review existe y pertenece a un item del usuario
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        booking: {
          item: {
            ownerId: session.user.id
          }
        }
      },
      include: {
        booking: {
          include: {
            item: true
          }
        }
      }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review no encontrado o no tienes permisos para responder' },
        { status: 404 }
      )
    }

    // Actualizar el review con la respuesta
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        response: response.trim(),
        responseDate: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      response: updatedReview.response
    })

  } catch (error) {
    console.error('Error al responder review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
