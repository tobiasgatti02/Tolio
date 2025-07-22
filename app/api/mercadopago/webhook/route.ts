import { NextRequest, NextResponse } from "next/server"
import { Payment, MercadoPagoConfig } from "mercadopago"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Función para mapear status de MercadoPago a nuestro sistema
function mapPaymentStatus(mpStatus: string): 'PENDING' | 'COMPLETED' | 'REFUNDED' {
  switch (mpStatus) {
    case 'approved':
      return 'COMPLETED'
    case 'pending':
    case 'in_process':
      return 'PENDING'
    case 'cancelled':
    case 'rejected':
    case 'refunded':
      return 'REFUNDED'
    default:
      return 'PENDING'
  }
}

const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!
})

export async function POST(request: NextRequest) {
  try {
    // Obtener el cuerpo de la petición que incluye información sobre la notificación
    const body: {
      data: { id: string }
      type: string
      action: string
    } = await request.json()

    console.log('📨 Webhook recibido:', JSON.stringify(body, null, 2))

    // Solo procesamos notificaciones de pagos
    if (body.type !== 'payment') {
      console.log('⚠️ Tipo de notificación no es payment:', body.type)
      return new Response(null, { status: 200 })
    }

    // Obtener el pago desde MercadoPago
    const payment = await new Payment(mercadoPagoClient).get({
      id: body.data.id
    })

    console.log('💳 Pago obtenido:', {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference
    })

    if (!payment.external_reference) {
      console.log('❌ Pago sin external_reference')
      return new Response(null, { status: 200 })
    }

    // Buscar el booking por external_reference
    const booking = await prisma.booking.findFirst({
      where: { id: payment.external_reference },
      include: {
        payment: true,
        item: {
          include: {
            owner: true
          }
        }
      }
    })

    if (!booking) {
      console.log('❌ Booking no encontrado para external_reference:', payment.external_reference)
      return new Response(null, { status: 200 })
    }

    // Mapear el status de MercadoPago a nuestro sistema
    const mappedStatus = mapPaymentStatus(payment.status!)

    // Calcular montos del marketplace si el pago fue aprobado
    let marketplaceFee = 0
    let ownerAmount = 0
    let marketplaceAmount = 0

    if (payment.status === 'approved' && payment.transaction_amount) {
      const commissionPercentage = parseFloat(process.env.MARKETPLACE_COMMISSION_PERCENTAGE || '2') / 100
      marketplaceFee = payment.transaction_amount * commissionPercentage
      ownerAmount = payment.transaction_amount - marketplaceFee
      marketplaceAmount = marketplaceFee
    }

    // Actualizar o crear el registro de pago
    if (booking.payment) {
      // Actualizar pago existente
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: {
          status: mappedStatus,
          mercadopagoPaymentId: payment.id?.toString(),
          mercadopagoStatus: payment.status,
          mercadopagoStatusDetail: payment.status_detail,
          paidAt: payment.status === 'approved' ? new Date() : null,
        }
      })
    } else {
      // Crear nuevo pago
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: payment.transaction_amount || booking.totalPrice,
          paymentMethod: payment.payment_method_id || 'mercadopago',
          status: mappedStatus,
          mercadopagoPaymentId: payment.id?.toString(),
          mercadopagoStatus: payment.status,
          mercadopagoStatusDetail: payment.status_detail,
          externalReference: payment.external_reference,
          paymentProvider: 'mercadopago',
          paidAt: payment.status === 'approved' ? new Date() : null,
        }
      })
    }

    // Actualizar el status del booking según el pago
    let bookingStatus = booking.status
    if (payment.status === 'approved') {
      bookingStatus = 'CONFIRMED'
    } else if (payment.status === 'cancelled' || payment.status === 'rejected') {
      bookingStatus = 'CANCELLED'
    }

    if (bookingStatus !== booking.status) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: bookingStatus }
      })
    }

    // Crear notificaciones
    if (payment.status === 'approved') {
      // Notificación para el owner (propietario)
      await prisma.notification.create({
        data: {
          userId: booking.item.ownerId,
          type: 'PAYMENT_RECEIVED',
          title: 'Pago recibido',
          content: `Has recibido $${ownerAmount.toFixed(2)} por el alquiler de "${booking.item.title}"`,
        }
      })

      // Notificación para el renter (inquilino)
      await prisma.notification.create({
        data: {
          userId: booking.borrowerId,
          type: 'BOOKING_CONFIRMED',
          title: 'Reserva confirmada',
          content: `Tu pago ha sido procesado y tu reserva de "${booking.item.title}" está confirmada`,
        }
      })
    }

    console.log('✅ Webhook procesado exitosamente')
    return new Response(null, { status: 200 })

  } catch (error) {
    console.error('❌ Error procesando webhook:', error)
    // Retornamos 200 para evitar que MercadoPago reenvíe la notificación
    // En un entorno de producción, podrías querer retornar 500 para algunos errores
    return new Response(null, { status: 200 })
  }
}
