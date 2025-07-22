import { NextRequest } from 'next/server'
import { Payment } from 'mercadopago'
import { PrismaClient } from '@prisma/client'
import { MercadoPagoConfig } from 'mercadopago'

const prisma = new PrismaClient()

// Cliente de Mercado Pago principal (marketplace)
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!
})

export async function POST(request: NextRequest) {
  try {
    // Obtener parámetros de la URL (para notificaciones tipo merchant_order)
    const searchParams = request.nextUrl.searchParams
    const topicFromUrl = searchParams.get('topic')
    const idFromUrl = searchParams.get('id')
    
    // Obtener parámetros del body (para notificaciones tipo payment)
    let body: any = {}
    try {
      body = await request.json()
    } catch {
      // Si no hay body JSON, usar parámetros de URL
    }
    
    const typeFromBody = body.type
    const dataIdFromBody = body.data?.id
    
    console.log('🔔 Webhook received:')
    console.log('type from body:', typeFromBody)
    console.log('topic from URL:', topicFromUrl)
    console.log('data.id from body:', dataIdFromBody)
    console.log('id from URL:', idFromUrl)
    console.log('Full body:', body)
    
    // Determinar el tipo de notificación y el ID
    let paymentId: string | null = null
    
    if (typeFromBody === 'payment' && dataIdFromBody) {
      // Formato estándar: {"type": "payment", "data": {"id": "123"}}
      paymentId = dataIdFromBody
    } else if (topicFromUrl === 'merchant_order' && idFromUrl) {
      // Para merchant_order, usar el ID directamente (este puede ser diferente)
      // Por ahora, ignoramos merchant_order y solo procesamos payment
      console.log('Received merchant_order notification, ignoring')
      return new Response(null, { status: 200 })
    } else if (body.data?.id) {
      // Fallback: usar cualquier ID que venga en body.data.id
      paymentId = body.data.id
    }
    
    if (!paymentId) {
      console.log('No payment ID found in notification')
      return new Response(null, { status: 200 })
    }

    console.log('💳 Attempting to get payment with ID:', paymentId)

    // Primero intentamos con el access token del marketplace
    let payment: any
    let paymentFound = false
    
    try {
      payment = await new Payment(mercadopago).get({id: paymentId})
      paymentFound = true
      console.log('✅ Payment found with marketplace token')
    } catch (marketplaceError: any) {
      console.log('❌ Payment not found with marketplace token:', marketplaceError.message)
      
      // Si no se encuentra con el token del marketplace, 
      // necesitamos buscar el booking para obtener el access token del owner
      try {
        // Intentar obtener el pago usando el external_reference
        // Primero hacemos una consulta básica para obtener información del pago
        const paymentInfo = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
          }
        })
        
        if (paymentInfo.ok) {
          const paymentData = await paymentInfo.json()
          const bookingId = paymentData.external_reference
          
          if (bookingId) {
            // Buscar el booking para obtener el owner access token
            const booking = await prisma.booking.findUnique({
              where: { id: bookingId },
              include: {
                item: {
                  include: {
                    owner: true
                  }
                }
              }
            })
            
            if (booking?.item?.owner?.marketplaceAccessToken) {
              console.log('🔄 Trying with owner access token...')
              
              // Crear cliente con el access token del owner
              const ownerMercadoPago = new MercadoPagoConfig({
                accessToken: booking.item.owner.marketplaceAccessToken
              })
              
              payment = await new Payment(ownerMercadoPago).get({id: paymentId})
              paymentFound = true
              console.log('✅ Payment found with owner token')
            }
          }
        }
      } catch (ownerError: any) {
        console.log('❌ Could not get payment with owner token:', ownerError.message)
      }
    }

    if (!paymentFound) {
      console.log('❌ Payment not found with any token')
      return new Response(null, { status: 200 })
    }

    console.log('📄 Payment status:', payment.status)
    console.log('📄 Payment external_reference:', payment.external_reference)

    // Si se aprueba, actualizamos el estado
    if (payment.status === 'approved') {
      const bookingId = payment.external_reference
      
      if (bookingId) {
        // Actualizar el estado del pago
        await prisma.payment.updateMany({
          where: { bookingId },
          data: {
            mercadopagoPaymentId: payment.id?.toString(),
            mercadopagoStatus: payment.status,
            status: 'COMPLETED',
            paidAt: new Date()
          }
        })

        // Actualizar el estado de la reserva
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' }
        })
        
        console.log('✅ Payment processed successfully:', paymentId)
      }
    }
  } catch (error) {
    // Log del error pero no fallar
    console.log('Webhook error:', error)
  }

  // Responder con status 200 para indicar que la notificación fue recibida
  return new Response(null, { status: 200 })
}

