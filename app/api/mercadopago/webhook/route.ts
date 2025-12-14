import { NextRequest, NextResponse } from "next/server"
import { Payment, MercadoPagoConfig } from "mercadopago"
import prisma from "@/lib/prisma"



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

    // Buscar el booking por metadata (puede ser booking de items o service booking)
    let booking = null
    let serviceBooking = null
    
    // Intentar buscar en metadata del pago
    const bookingId = (payment.metadata as any)?.booking_id || payment.external_reference
    
    if (bookingId) {
      // Buscar primero en service bookings
      serviceBooking = await prisma.serviceBooking.findFirst({
        where: { id: bookingId },
        include: {
          payments: true,
          User_ServiceBooking_providerIdToUser: true,
          User_ServiceBooking_clientIdToUser: true,
        }
      })
      
      // Si no se encuentra, buscar en bookings de items
      if (!serviceBooking) {
        booking = await prisma.booking.findFirst({
          where: { id: bookingId },
          include: {
            Item: {
              include: {
                User: true
              }
            }
          }
        })
      }
    }

    if (!booking && !serviceBooking) {
      console.log('❌ Booking no encontrado para:', bookingId)
      return new Response(null, { status: 200 })
    }

    // Mapear el status de MercadoPago a nuestro sistema
    const mappedStatus = mapPaymentStatus(payment.status!)

    // Procesar pagos de servicios
    if (serviceBooking) {
      // Calcular montos del marketplace si el pago fue aprobado
      let marketplaceFee = 0
      let providerAmount = 0

      if (payment.status === 'approved' && payment.transaction_amount) {
        // Obtener el fee del marketplace desde el pago (ya calculado por MercadoPago)
        // En split payments, MercadoPago ya divide el pago automáticamente
        const commissionPercentage = parseFloat(process.env.MARKETPLACE_FEE_PERCENTAGE || '2') / 100
        // El marketplace_fee ya está aplicado por MercadoPago, solo necesitamos calcularlo para registro
        marketplaceFee = Math.round(payment.transaction_amount * commissionPercentage * 100) / 100
        providerAmount = payment.transaction_amount - marketplaceFee
      }

      // Actualizar o crear el registro de pago
      const existingPayment = serviceBooking.payments?.[0]
      if (existingPayment) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: mappedStatus,
            platformFee: marketplaceFee,
            providerAmount: providerAmount,
            paidAt: payment.status === 'approved' ? new Date() : null,
            metadata: {
              ...(existingPayment.metadata as object || {}),
              mercadopagoPaymentId: payment.id?.toString(),
              mercadopagoStatus: payment.status,
            },
          }
        })
      }

      // Actualizar el status del service booking según el pago
      if (payment.status === 'approved' && !serviceBooking.servicePaid) {
        await prisma.serviceBooking.update({
          where: { id: serviceBooking.id },
          data: { servicePaid: true }
        })
      }

      // Crear notificaciones
      if (payment.status === 'approved') {
        await prisma.notification.create({
          data: {
            id: `notif-${Date.now()}-${serviceBooking.providerId}`,
            userId: serviceBooking.providerId,
            type: 'PAYMENT_RECEIVED',
            title: 'Pago recibido',
            content: `Has recibido $${providerAmount.toFixed(2)} por el servicio completado`,
          }
        })

        await prisma.notification.create({
          data: {
            id: `notif-${Date.now()}-${serviceBooking.clientId}`,
            userId: serviceBooking.clientId,
            type: 'BOOKING_CONFIRMED',
            title: 'Pago completado',
            content: `Tu pago ha sido procesado exitosamente`,
          }
        })
      }

      console.log('✅ Webhook procesado exitosamente para service booking')
      return new Response(null, { status: 200 })
    }

    // Procesar pagos de items (código existente)
    if (booking) {
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

      // Para bookings de items, el pago se maneja diferente (no hay modelo Payment para bookings de items en este schema)
      // Solo actualizamos el estado del booking

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

      // Crear notificaciones para bookings de items
      if (payment.status === 'approved' && booking.Item) {
        await prisma.notification.create({
          data: {
            id: `notif-${Date.now()}-${booking.ownerId}`,
            userId: booking.ownerId,
            type: 'PAYMENT_RECEIVED',
            title: 'Pago recibido',
            content: `Has recibido $${ownerAmount.toFixed(2)} por el alquiler de "${booking.Item.title}"`,
          }
        })

        await prisma.notification.create({
          data: {
            id: `notif-${Date.now()}-${booking.borrowerId}`,
            userId: booking.borrowerId,
            type: 'BOOKING_CONFIRMED',
            title: 'Reserva confirmada',
            content: `Tu pago ha sido procesado y tu reserva de "${booking.Item.title}" está confirmada`,
          }
        })
      }
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

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
