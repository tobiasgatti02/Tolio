import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/lib/prisma"



export async function GET(request: NextRequest) {
  try {
    // Obtener todas las reservas con información de pago
    const bookings = await prisma.booking.findMany({
      include: {
        Item: {
          select: {
            title: true,
          }
        },
        User_Booking_borrowerIdToUser: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        User_Booking_ownerIdToUser: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        Payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calcular estadísticas
    const stats = bookings.reduce((acc, booking) => {
      acc.totalBookings++
      
      const totalPrice = booking.totalPrice || 0
      const platformFee = booking.Payment?.marketplaceFee || Math.round(totalPrice * 0.05)
      const ownerAmount = booking.Payment?.ownerAmount || (totalPrice - platformFee)

      if (booking.Payment?.stripeTransferId) {
        // Pago ya capturado y transferido
        acc.capturedAmount += totalPrice
        acc.totalFees += platformFee
      } else if (booking.Payment?.stripePaymentIntentId) {
        // Pago autorizado pero no capturado
        acc.pendingAmount += totalPrice
      }

      return acc
    }, {
      totalBookings: 0,
      pendingAmount: 0,
      capturedAmount: 0,
      totalFees: 0
    })

    // Formatear los datos para el frontend
    const formattedBookings = bookings.map(booking => {
      const totalPrice = booking.totalPrice || 0
      const platformFee = booking.Payment?.marketplaceFee || Math.round(totalPrice * 0.05)
      const ownerAmount = booking.Payment?.ownerAmount || (totalPrice - platformFee)

      return {
        id: booking.id,
        itemTitle: booking.Item.title,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalPrice: totalPrice,
        status: booking.status,
        stripePaymentIntentId: booking.Payment?.stripePaymentIntentId || null,
        stripeTransferId: booking.Payment?.stripeTransferId || null,
        platformFee: platformFee,
        ownerAmount: ownerAmount,
        renterName: `${booking.User_Booking_borrowerIdToUser.firstName} ${booking.User_Booking_borrowerIdToUser.lastName}`,
        ownerName: `${booking.User_Booking_ownerIdToUser.firstName} ${booking.User_Booking_ownerIdToUser.lastName}`,
        createdAt: booking.createdAt.toISOString()
      }
    })

    return NextResponse.json({
      bookings: formattedBookings,
      stats
    })

  } catch (error) {
    console.error('Error fetching payments admin data:', error)
    return NextResponse.json({ 
      error: 'Error al obtener datos de pagos' 
    }, { status: 500 })
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
