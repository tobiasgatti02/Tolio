import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { bookingId } = params

    // Obtener el booking con toda la información relacionada
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        item: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true
              }
            }
          }
        },
        borrower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ message: "Reserva no encontrada" }, { status: 404 })
    }

    // Verificar que el usuario tiene permiso para ver esta reserva
    const isOwner = booking.item.owner.id === session.user.id
    const isBorrower = booking.borrower.id === session.user.id

    if (!isOwner && !isBorrower) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 })
    }

    // Formatear la respuesta
    const response = {
      id: booking.id,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      totalAmount: booking.totalPrice,
      deposit: booking.item.deposit, // El depósito está en el item
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      userRole: isOwner ? 'owner' : 'borrower',
      item: {
        id: booking.item.id,
        name: booking.item.title,
        description: booking.item.description,
        images: booking.item.images,
        pricePerDay: booking.item.price,
        location: booking.item.location
      },
      borrower: isOwner ? {
        id: booking.borrower.id,
        firstName: booking.borrower.firstName,
        lastName: booking.borrower.lastName,
        email: booking.borrower.email,
        profileImage: booking.borrower.profileImage
      } : undefined,
      owner: isBorrower ? {
        id: booking.item.owner.id,
        firstName: booking.item.owner.firstName,
        lastName: booking.item.owner.lastName,
        email: booking.item.owner.email,
        profileImage: booking.item.owner.profileImage
      } : undefined
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching booking details:', error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
