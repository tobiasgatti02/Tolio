import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { bookingId } = await params

    // Obtener el booking con toda la información relacionada
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Item: {
          include: {
            User: {
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
        User_Booking_borrowerIdToUser: {
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
    const isOwner = booking.Item.User.id === session.user.id
    const isBorrower = booking.User_Booking_borrowerIdToUser.id === session.user.id

    if (!isOwner && !isBorrower) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 })
    }

    // Formatear la respuesta
    const response = {
      id: booking.id,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      totalAmount: booking.totalPrice,
      deposit: booking.Item.deposit, // El depósito está en el item
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      userRole: isOwner ? 'owner' : 'borrower',
      item: {
        id: booking.Item.id,
        name: booking.Item.title,
        description: booking.Item.description,
        images: booking.Item.images,
        pricePerDay: booking.Item.price,
        location: booking.Item.location
      },
      borrower: isOwner ? {
        id: booking.User_Booking_borrowerIdToUser.id,
        firstName: booking.User_Booking_borrowerIdToUser.firstName,
        lastName: booking.User_Booking_borrowerIdToUser.lastName,
        email: booking.User_Booking_borrowerIdToUser.email,
        profileImage: booking.User_Booking_borrowerIdToUser.profileImage
      } : undefined,
      owner: isBorrower ? {
        id: booking.Item.User.id,
        firstName: booking.Item.User.firstName,
        lastName: booking.Item.User.lastName,
        email: booking.Item.User.email,
        profileImage: booking.Item.User.profileImage
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

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
