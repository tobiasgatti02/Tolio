import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/utils"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: bookingId } = await params

    // Primero buscar en reservas de items
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Item: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            location: true,
          }
        },
        User_Booking_ownerIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        },
        User_Booking_borrowerIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        },
      }
    })

    if (booking) {
      // Verificar autorización
      if (booking.borrowerId !== session.user.id && booking.ownerId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }

      return NextResponse.json({
        id: booking.id,
        status: booking.status,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        type: 'item',
        item: {
          id: booking.Item.id,
          title: booking.Item.title,
          images: booking.Item.images,
          price: booking.Item.price,
          location: booking.Item.location,
        },
        owner: booking.User_Booking_ownerIdToUser,
        borrower: booking.User_Booking_borrowerIdToUser,
        ownerId: booking.ownerId,
        borrowerId: booking.borrowerId,
      })
    }

    // Si no se encuentra, buscar en reservas de servicios
    const serviceBooking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: {
        Service: {
          select: {
            id: true,
            title: true,
            pricePerHour: true,
            images: true,
            location: true,
          }
        },
        User_ServiceBooking_providerIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        },
        User_ServiceBooking_clientIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        },
      }
    })

    if (serviceBooking) {
      // Verificar autorización
      if (serviceBooking.clientId !== session.user.id && serviceBooking.providerId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }

      return NextResponse.json({
        id: serviceBooking.id,
        status: serviceBooking.status,
        startDate: serviceBooking.startDate.toISOString(),
        endDate: (serviceBooking.endDate || serviceBooking.startDate).toISOString(),
        totalPrice: serviceBooking.totalPrice,
        createdAt: serviceBooking.createdAt.toISOString(),
        updatedAt: serviceBooking.updatedAt.toISOString(),
        type: 'service',
        item: {
          id: serviceBooking.Service.id,
          title: serviceBooking.Service.title,
          images: serviceBooking.Service.images,
          price: serviceBooking.Service.pricePerHour || 0,
          location: serviceBooking.Service.location,
        },
        owner: serviceBooking.User_ServiceBooking_providerIdToUser,
        borrower: serviceBooking.User_ServiceBooking_clientIdToUser,
        ownerId: serviceBooking.providerId,
        borrowerId: serviceBooking.clientId,
      })
    }

    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}