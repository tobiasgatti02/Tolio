import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateConfirmationResponse, mapPayUState, type PayUConfirmationResponse } from '../../../../lib/payu'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  console.log('🔔 PayU Confirmation webhook received')
  
  try {
    const formData = await request.formData()
    
    // Convertir FormData a objeto
    const data: Partial<PayUConfirmationResponse> = {}
    for (const [key, value] of formData.entries()) {
      data[key as keyof PayUConfirmationResponse] = value.toString()
    }
    
    console.log('📄 PayU confirmation data:', data)
    
    // Validar la firma
    if (!validateConfirmationResponse(data as PayUConfirmationResponse)) {
      console.log('❌ Invalid PayU signature')
      return new Response('Invalid signature', { status: 400 })
    }
    
    const referenceCode = data.reference_sale
    if (!referenceCode) {
      console.log('❌ No reference code in PayU confirmation')
      return new Response('No reference code', { status: 400 })
    }
    
    // Buscar el booking por reference code
    const booking = await prisma.booking.findFirst({
      where: { id: referenceCode },
      include: {
        payment: true,
        item: {
          include: {
            owner: true
          }
        },
        borrower: true
      }
    })
    
    if (!booking) {
      console.log('❌ Booking not found for reference:', referenceCode)
      return new Response('Booking not found', { status: 404 })
    }
    
    console.log('📦 Booking found:', booking.id)
    
    // Mapear el estado de PayU a nuestro sistema
    const mappedStatus = mapPayUState(data.state_pol || '')
    
    // Calcular montos del marketplace si la transacción fue aprobada
    let marketplaceFee = 0
    let ownerAmount = 0
    let marketplaceAmount = 0
    
    if (data.state_pol === '4' && data.value) { // Estado 4 = Aprobada
      const totalAmount = parseFloat(data.value)
      const commissionPercentage = parseFloat(process.env.MARKETPLACE_COMMISSION_PERCENTAGE || '2') / 100
      marketplaceFee = totalAmount * commissionPercentage
      ownerAmount = totalAmount - marketplaceFee
      marketplaceAmount = marketplaceFee
    }
    
    // Actualizar o crear el registro de pago
    if (booking.payment) {
      // Actualizar pago existente
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: {
          status: mappedStatus,
          payuTransactionId: data.transaction_id,
          payuResponseCode: data.response_code_pol,
          payuState: data.state_pol,
          payuReference: data.reference_pol,
          payuSignature: data.sign,
          paidAt: data.state_pol === '4' ? new Date() : null,
          marketplaceFee,
          ownerAmount,
          marketplaceAmount,
        }
      })
      
      console.log('✅ Payment updated:', booking.payment.id)
    } else {
      // Crear nuevo pago
      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: parseFloat(data.value || '0'),
          paymentMethod: 'payu',
          paymentProvider: 'payu',
          status: mappedStatus,
          payuTransactionId: data.transaction_id,
          payuResponseCode: data.response_code_pol,
          payuState: data.state_pol,
          payuReference: data.reference_pol,
          payuSignature: data.sign,
          paidAt: data.state_pol === '4' ? new Date() : null,
          marketplaceFee,
          ownerAmount,
          marketplaceAmount,
        }
      })
      
      console.log('✅ Payment created:', payment.id)
    }
    
    // Actualizar estado del booking si el pago fue aprobado
    if (data.state_pol === '4') {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { 
          status: 'CONFIRMED',
          confirmedAt: new Date()
        }
      })
      
      // Crear notificaciones
      await prisma.notification.create({
        data: {
          type: 'PAYMENT_RECEIVED',
          title: 'Pago recibido',
          content: `Has recibido el pago por "${booking.item.title}"`,
          userId: booking.item.ownerId
        }
      })
      
      await prisma.notification.create({
        data: {
          type: 'BOOKING_CONFIRMED',
          title: 'Reserva confirmada',
          content: `Tu reserva de "${booking.item.title}" ha sido confirmada`,
          userId: booking.borrowerId
        }
      })
      
      console.log('✅ Booking confirmed and notifications sent')
    }
    
    return new Response('OK', { status: 200 })
    
  } catch (error) {
    console.error('❌ Error processing PayU confirmation:', error)
    return new Response('Internal Server Error', { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
