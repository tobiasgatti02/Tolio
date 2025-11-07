import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { serviceId, startDate, hours, skipPayment } = body

    if (!serviceId || !startDate || !hours) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Verificar que el servicio existe y obtener el provider
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        provider: true
      }
    })

    if (!service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    if (!service.isAvailable) {
      return NextResponse.json({ error: 'Servicio no disponible' }, { status: 400 })
    }

    if (service.providerId === session.user.id) {
      return NextResponse.json({ error: 'No puedes reservar tu propio servicio' }, { status: 400 })
    }

    // Crear la reserva de servicio
    const booking = await prisma.serviceBooking.create({
      data: {
        serviceId: serviceId,
        clientId: session.user.id,
        providerId: service.providerId,
        startDate: new Date(startDate),
        hours: parseFloat(hours),
        status: 'PENDING'
      },
      include: {
        service: true,
        client: true,
        provider: true
      }
    })

    return NextResponse.json({
      message: 'Reserva de servicio creada exitosamente',
      booking: {
        id: booking.id,
        status: booking.status,
        startDate: booking.startDate,
        hours: booking.hours,
        service: {
          title: booking.service.title
        }
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating service booking:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}