import { NextRequest, NextResponse } from 'next/server'
import { getPaymentInfo, getPaymentStatus } from '@/lib/mercadopago'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Webhook received:', body)

    // MercadoPago envía diferentes tipos de notificaciones
    if (body.type === 'payment') {
      const paymentId = body.data?.id

      if (!paymentId) {
        console.log('No payment ID in webhook')
        return NextResponse.json({ status: 'ok' })
      }

      // Obtener información del pago desde MercadoPago
      const paymentInfo = await getPaymentInfo(paymentId.toString())
      
      if (!paymentInfo) {
        console.log('Payment info not found for ID:', paymentId)
        return NextResponse.json({ status: 'error', message: 'Payment not found' })
      }

      const externalReference = paymentInfo.external_reference
      
      if (!externalReference) {
        console.log('No external reference in payment')
        return NextResponse.json({ status: 'ok' })
      }

      // Buscar el pago en nuestra base de datos usando el booking ID
      const payment = await prisma.payment.findFirst({
        where: {
          bookingId: externalReference
        },
        include: {
          booking: {
            include: {
              borrower: true,
              owner: true,
              item: true
            }
          }
        }
      })

      if (!payment) {
        console.log('Payment not found in database for booking:', externalReference)
        return NextResponse.json({ status: 'ok' })
      }

      // Actualizar el estado del pago
      const newStatus = getPaymentStatus(paymentInfo.status || '', paymentInfo.status_detail || '')
      
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          mercadopagoPaymentId: paymentId.toString(),
          mercadopagoStatus: paymentInfo.status,
          mercadopagoStatusDetail: paymentInfo.status_detail,
          status: newStatus,
          paidAt: newStatus === 'COMPLETED' ? new Date() : null
        }
      })

      // Si el pago fue aprobado, actualizar el estado de la reserva
      if (newStatus === 'COMPLETED') {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' }
        })

        // Crear notificación para el propietario
        await prisma.notification.create({
          data: {
            userId: payment.booking.owner.id,
            type: 'PAYMENT_RECEIVED',
            title: 'Pago recibido',
            content: `Has recibido un pago de $${payment.amount} por la reserva de "${payment.booking.item.title}"`,
            bookingId: payment.bookingId,
            actionUrl: `/dashboard/bookings/${payment.bookingId}`
          }
        })

        // Crear notificación para el prestatario
        await prisma.notification.create({
          data: {
            userId: payment.booking.borrower.id,
            type: 'BOOKING_CONFIRMED',
            title: 'Reserva confirmada',
            content: `Tu pago ha sido procesado y la reserva de "${payment.booking.item.title}" ha sido confirmada`,
            bookingId: payment.bookingId,
            actionUrl: `/bookings/${payment.bookingId}`
          }
        })
      }

      console.log('Payment updated:', {
        paymentId: payment.id,
        status: newStatus,
        mercadopagoId: paymentId
      })

      return NextResponse.json({ status: 'ok' })
    }

    // Para otros tipos de notificaciones, simplemente responder OK
    return NextResponse.json({ status: 'ok' })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// También manejar GET para validación del webhook
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const topic = searchParams.get('topic')
  const id = searchParams.get('id')

  console.log('Webhook GET validation:', { topic, id })

  return NextResponse.json({ status: 'ok' })
}
