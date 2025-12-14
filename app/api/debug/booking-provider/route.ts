import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

/**
 * GET /api/debug/booking-provider?bookingId=xxx
 * 
 * Endpoint de debug para verificar el estado de MercadoPago del proveedor de un booking
 */
export async function GET(request: NextRequest) {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Not allowed in production' },
        { status: 403 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const bookingId = request.nextUrl.searchParams.get('bookingId')
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId requerido' }, { status: 400 })
    }

    // Buscar el booking con los datos del proveedor
    const booking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        providerId: true,
        clientId: true,
        status: true,
        User_ServiceBooking_providerIdToUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            mercadopagoConnected: true,
            mercadopagoAccessToken: true,
            mercadopagoUserId: true,
            mercadopagoConnectedAt: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      bookingId: booking.id,
      providerId: booking.providerId,
      clientId: booking.clientId,
      currentUserId: session.user.id,
      provider: {
        id: booking.User_ServiceBooking_providerIdToUser.id,
        email: booking.User_ServiceBooking_providerIdToUser.email,
        name: `${booking.User_ServiceBooking_providerIdToUser.firstName} ${booking.User_ServiceBooking_providerIdToUser.lastName}`,
        mercadopagoConnected: booking.User_ServiceBooking_providerIdToUser.mercadopagoConnected,
        hasAccessToken: !!booking.User_ServiceBooking_providerIdToUser.mercadopagoAccessToken,
        accessTokenLength: booking.User_ServiceBooking_providerIdToUser.mercadopagoAccessToken?.length || 0,
        mercadopagoUserId: booking.User_ServiceBooking_providerIdToUser.mercadopagoUserId,
        connectedAt: booking.User_ServiceBooking_providerIdToUser.mercadopagoConnectedAt,
      },
    })
  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json(
      { error: 'Error interno', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs';

