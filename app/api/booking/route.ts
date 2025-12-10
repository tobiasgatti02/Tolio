import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { cache } from "react"
import { BookingStatus } from "@prisma/client"
import { createNotification } from "@/lib/notification-helpers"

// Define the response type
export type BookingResponse = {
  success: boolean;
  error?: string;
  bookingId?: string;
}

export async function createBooking(formData: FormData): Promise<BookingResponse> {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return {
      success: false,
      error: "Unauthorized"
    }
  }

  const userId = session.user.id

  try {
    const itemId = formData.get("itemId") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string

    if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
      return {
        success: false,
        error: "Formato de fecha inválido"
      }
    }

    if (Date.parse(startDate) > Date.parse(endDate)) {
      return {
        success: false,
        error: "La fecha de finalización debe ser posterior a la fecha de inicio"
      }
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: { price: true, ownerId: true, isAvailable: true }
    })

    if (!item || !item.isAvailable) {
      return {
        success: false,
        error: "Artículo no disponible"
      }
    }

    if (item.ownerId === userId) {
      return {
        success: false,
        error: "No puedes alquilar tu propio artículo"
      }
    }

    // Check for conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        itemId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            // New booking starts during an existing booking
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) }
          }
        ]
      }
    })

    if (conflictingBookings.length > 0) {
      return {
        success: false,
        error: "Este artículo ya está reservado para las fechas seleccionadas"
      }
    }

    // Calculate total price
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)
    const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime())
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const baseCost = item.price * totalDays
    const serviceFee = Math.round(baseCost * 0.1)
    const totalPrice = baseCost + serviceFee

    const booking = await prisma.booking.create({
      data: {
        startDate: startDateObj,
        endDate: endDateObj,
        totalPrice,
        status: "PENDING",
        itemId,
        borrowerId: userId,
        ownerId: item.ownerId
      },
      include: {
        Item: {
          select: {
            title: true
          }
        },
        User_Booking_borrowerIdToUser: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    await createNotification(
      item.ownerId,
      'BOOKING_REQUEST',
      {
        bookingId: booking.id,
        itemId: itemId,
        itemTitle: booking.Item.title,
        borrowerName: `${booking.User_Booking_borrowerIdToUser.firstName} ${booking.User_Booking_borrowerIdToUser.lastName}`.trim()
      }
    )

    // Revalidate paths to update UI
    revalidatePath(`/items/${itemId}`)
    revalidatePath(`/bookings`)

    return {
      success: true,
      bookingId: booking.id
    }
  } catch (error) {
    console.error("Failed to create booking:", error)
    return {
      success: false,
      error: "Error al crear la reserva. Por favor, inténtalo de nuevo."
    }
  }
}



export const getBookings = cache(async (userId?: string) => {
  try {
    // Get bookings with related data
    const bookings = await prisma.booking.findMany({
      where: userId ? {
        OR: [
          { borrowerId: userId },
          { ownerId: userId }
        ]
      } : undefined,
      include: {
        Item: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
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
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Correctly map each booking
    return bookings.map(booking => ({
      ...booking, // Correctly spread the booking object
      startDate: booking.startDate,
      endDate: booking.endDate,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }))
  } catch (error) {
    console.error("Failed to fetch bookings:", error)
    throw new Error("Failed to fetch bookings")
  }
})

export async function handleReservationStatus(bookingId: string, status: BookingStatus): Promise<BookingResponse> {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return {
      success: false,
      error: "Unauthorized"
    }
  }

  const userId = session.user.id

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { status: true, ownerId: true, borrowerId: true }
    })

    if (!booking) {
      return {
        success: false,
        error: "Reserva no encontrada"
      }
    }

    if (booking.ownerId !== userId && booking.borrowerId !== userId) {
      return {
        success: false,
        error: "No tienes permiso para modificar esta reserva"
      }
    }

    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      return {
        success: false,
        error: "La reserva ya ha sido cancelada o completada"
      }
    }

    if (status === "CANCELLED" && booking.status === "PENDING") {
      await prisma.booking.delete({
        where: { id: bookingId }
      })
    } else {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status }
      })
    }

    revalidatePath(`/bookings`)

    return {
      success: true
    }
  } catch (error) {
    console.error("Failed to update booking status:", error)
    return {
      success: false,
      error: "Error al actualizar el estado de la reserva. Por favor, inténtalo de nuevo."
    }
  }
}

export async function getBookingById(bookingId: string) {
  try {
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
            email: true,
            phoneNumber: true,
            isVerified: true,
          }
        },
        User_Booking_borrowerIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            email: true,
            phoneNumber: true,
            isVerified: true,
          }
        },
        Review: true
      }
    })

    if (booking) {
      return { ...booking, type: 'item' }
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
            email: true,
            phoneNumber: true,
            isVerified: true,
          }
        },
        User_ServiceBooking_clientIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            email: true,
            phoneNumber: true,
            isVerified: true,
          }
        },
        ServiceReview: true
      }
    })

    if (serviceBooking) {
      // Mapear ServiceBooking al formato esperado por la página
      return {
        ...serviceBooking,
        type: 'service',
        // Mapear campos para compatibilidad
        item: {
          id: serviceBooking.service.id,
          title: serviceBooking.service.title,
          price: serviceBooking.service.pricePerHour || 0,
          images: serviceBooking.service.images,
          location: serviceBooking.service.location,
        },
        owner: serviceBooking.provider,
        borrower: serviceBooking.client,
        ownerId: serviceBooking.providerId,
        borrowerId: serviceBooking.clientId,
        endDate: serviceBooking.endDate || serviceBooking.startDate, // Servicios pueden no tener endDate
      }
    }

    return null
  } catch (error) {
    console.error("Failed to fetch booking:", error)
    return null
  }
}

// HTTP POST endpoint for creating bookings (for Stripe integration)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { itemId, startDate, endDate, totalDays, skipPayment, totalPrice, ownerId } = body

    console.log('Received booking request:', {
      totalPrice, startDate, endDate, itemId, ownerId, totalDays, skipPayment,
      userId: session.user.id
    })

    if (!itemId || !startDate || (!endDate && !skipPayment)) {
      return NextResponse.json({
        error: 'Faltan campos requeridos'
      }, { status: 400 })
    }

    // Validate dates
    if (isNaN(Date.parse(startDate))) {
      return NextResponse.json({
        error: 'Formato de fecha inválido'
      }, { status: 400 })
    }

    // For paid bookings, validate end date
    if (!skipPayment) {
      if (!endDate || isNaN(Date.parse(endDate))) {
        return NextResponse.json({
          error: 'Formato de fecha de fin inválido'
        }, { status: 400 })
      }
      if (Date.parse(startDate) > Date.parse(endDate)) {
        return NextResponse.json({
          error: 'La fecha de finalización debe ser posterior a la fecha de inicio'
        }, { status: 400 })
      }
    }

    // Get item details if not provided
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: {
        price: true,
        ownerId: true,
        isAvailable: true,
        title: true
      }
    })

    if (!item || !item.isAvailable) {
      return NextResponse.json({
        error: 'Artículo no disponible'
      }, { status: 400 })
    }

    // Check if user is trying to book their own item
    if (item.ownerId === session.user.id) {
      return NextResponse.json({
        error: 'No puedes alquilar tu propio artículo'
      }, { status: 400 })
    }

    // For skipPayment bookings, calculate dates and price
    let finalEndDate: Date
    let finalTotalPrice: number

    if (skipPayment) {
      const days = totalDays || 1
      finalEndDate = new Date(startDate)
      finalEndDate.setDate(finalEndDate.getDate() + days - 1)

      const baseCost = item.price * days
      const serviceFee = Math.round(baseCost * 0.1)
      finalTotalPrice = baseCost + serviceFee
    } else {
      finalEndDate = new Date(endDate!)
      finalTotalPrice = totalPrice
    }

    // Check for conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        itemId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            startDate: { lte: finalEndDate },
            endDate: { gte: new Date(startDate) }
          }
        ]
      }
    })

    if (conflictingBookings.length > 0) {
      return NextResponse.json({
        error: 'Este artículo ya está reservado para las fechas seleccionadas'
      }, { status: 409 })
    }

    // Create the booking
    console.log('Creating booking with data:', {
      startDate: new Date(startDate),
      endDate: finalEndDate,
      totalPrice: finalTotalPrice,
      status: skipPayment ? "PENDING" : "CONFIRMED",
      itemId,
      borrowerId: session.user.id,
      ownerId: item.ownerId
    })

    const booking = await prisma.booking.create({
      data: {
        startDate: new Date(startDate),
        endDate: finalEndDate,
        totalPrice: finalTotalPrice,
        status: skipPayment ? "PENDING" : "CONFIRMED",
        itemId,
        borrowerId: session.user.id,
        ownerId: item.ownerId
      },
      include: {
        Item: {
          select: {
            title: true
          }
        },
        User_Booking_borrowerIdToUser: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    console.log('Booking created successfully:', booking.id)

    // Create notification for owner
    console.log('Creating notification for owner:', item.ownerId)

    try {
      await createNotification(
        item.ownerId,
        'BOOKING_REQUEST',
        {
          bookingId: booking.id,
          itemId: itemId,
          itemTitle: booking.Item.title,
          borrowerName: `${booking.User_Booking_borrowerIdToUser.firstName} ${booking.User_Booking_borrowerIdToUser.lastName}`.trim()
        }
      )
      console.log('Notification created successfully')
    } catch (notifError) {
      console.error('Error creating notification:', notifError)
      // No fallar la reserva si la notificación falla
    }

    return NextResponse.json(booking)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    const errorStack = err instanceof Error ? err.stack : ''
    console.error('Error creating booking:', errorMessage)
    console.error('Stack trace:', errorStack)
    return NextResponse.json({
      error: 'Error al crear la reserva: ' + errorMessage
    }, { status: 500 })
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';