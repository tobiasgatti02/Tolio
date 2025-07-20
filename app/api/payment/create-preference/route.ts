import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { createPaymentPreference } from '@/lib/mercadopago'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'ID de reserva requerido' },
        { status: 400 }
      )
    }

    // Buscar la reserva
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        item: {
          include: {
            owner: true
          }
        },
        borrower: true,
        payment: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el usuario sea el prestatario
    if (booking.borrowerId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para pagar esta reserva' },
        { status: 403 }
      )
    }

    // Verificar que la reserva esté pendiente
    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Esta reserva no está pendiente de pago' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un pago
    if (booking.payment) {
      return NextResponse.json(
        { error: 'Ya existe un pago para esta reserva' },
        { status: 400 }
      )
    }

    // Crear preferencia de pago
    const preference = await createPaymentPreference({
      bookingId: booking.id,
      amount: booking.totalPrice,
      title: `Reserva: ${booking.item.title}`,
      description: `Alquiler del ${booking.startDate.toLocaleDateString()} al ${booking.endDate.toLocaleDateString()}`,
      userEmail: booking.borrower.email,
      userName: `${booking.borrower.firstName} ${booking.borrower.lastName}`
    })

    // Crear registro de pago en la base de datos
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        paymentMethod: 'mercadopago',
        paymentProvider: 'mercadopago',
        preferenceId: preference.preferenceId,
        externalReference: booking.id,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        preferenceId: preference.preferenceId,
        initPoint: preference.initPoint,
        sandboxInitPoint: preference.sandboxInitPoint
      }
    })

  } catch (error) {
    console.error('Error creating payment preference:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
