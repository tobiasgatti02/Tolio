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
        item: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            location: true,
          }
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        },
        borrower: {
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
          id: booking.item.id,
          title: booking.item.title,
          images: booking.item.images,
          price: booking.item.price,
          location: booking.item.location,
        },
        owner: booking.owner,
        borrower: booking.borrower,
        ownerId: booking.ownerId,
        borrowerId: booking.borrowerId,
      })
    }

    // Si no se encuentra, buscar en reservas de servicios
    const serviceBooking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            pricePerHour: true,
            images: true,
            location: true,
          }
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        },
        client: {
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
          id: serviceBooking.service.id,
          title: serviceBooking.service.title,
          images: serviceBooking.service.images,
          price: serviceBooking.service.pricePerHour || 0,
          location: serviceBooking.service.location,
        },
        owner: serviceBooking.provider,
        borrower: serviceBooking.client,
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