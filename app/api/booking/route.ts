"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { cache } from "react"
import { BookingStatus } from "@prisma/client"

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
        item: {
          select: {
            title: true
          }
        },
        borrower: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    await prisma.notification.create({
      data: {
        type: "BOOKING_REQUEST",
        title: "Nueva solicitud de reserva",
        content: `${booking.borrower.firstName} ${booking.borrower.lastName} quiere alquilar "${booking.item.title}"`,
        userId: item.ownerId,
        bookingId: booking.id,
        itemId: itemId,
        actionUrl: `/dashboard/bookings/${booking.id}`,
        metadata: {
          bookingId: booking.id,
          itemId: itemId,
          itemTitle: booking.item.title,
          borrowerName: `${booking.borrower.firstName} ${booking.borrower.lastName}`,
          startDate: startDate,
          endDate: endDate,
          totalPrice: totalPrice
        }
      }
    })

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
        item: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
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

export async function getBookingById(bookingId: string ) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
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
        }
      }
    })

    return {
      ...booking, // Correctly spread the booking object
      startDate: booking?.startDate,
      endDate: booking?.endDate,
      createdAt: booking?.createdAt,
      updatedAt: booking?.updatedAt
    }
  } catch (error) {
    console.error("Failed to fetch booking:", error)
    throw new Error("Failed to fetch booking")
  }
  
}