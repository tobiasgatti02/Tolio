import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  console.log('🔔 PayU Response webhook received')
  
  try {
    const formData = await request.formData()
    
    // Convertir FormData a objeto para logging
    const data: Record<string, string> = {}
    for (const [key, value] of formData.entries()) {
      data[key] = value.toString()
    }
    
    console.log('📄 PayU response data:', data)
    
    const referenceCode = data.referenceCode || data.reference_sale
    const state = data.lapTransactionState || data.transactionState
    
    if (!referenceCode) {
      console.log('❌ No reference code in PayU response')
      return NextResponse.redirect(new URL('/payment/failure?error=no-reference', request.url))
    }
    
    // Buscar el booking
    const booking = await prisma.booking.findFirst({
      where: { id: referenceCode },
      include: {
        payment: true,
        item: true
      }
    })
    
    if (!booking) {
      console.log('❌ Booking not found for reference:', referenceCode)
      return NextResponse.redirect(new URL('/payment/failure?error=booking-not-found', request.url))
    }
    
    // Redirigir según el estado
    let redirectUrl = '/payment/pending'
    
    switch (state) {
      case '4': // Aprobada
        redirectUrl = '/payment/success'
        console.log('✅ Payment approved:', referenceCode)
        break
      case '6': // Rechazada
      case '104': // Error
        redirectUrl = '/payment/failure'
        console.log('❌ Payment failed:', referenceCode)
        break
      case '7': // Pendiente
      case '15': // Pendiente
        redirectUrl = '/payment/pending'
        console.log('⏳ Payment pending:', referenceCode)
        break
      default:
        redirectUrl = '/payment/pending'
        console.log('❓ Unknown payment state:', state)
    }
    
    // Agregar parámetros a la URL de redirección
    const finalUrl = new URL(redirectUrl, request.url)
    finalUrl.searchParams.set('reference', referenceCode)
    finalUrl.searchParams.set('bookingId', booking.id)
    
    return NextResponse.redirect(finalUrl)
    
  } catch (error) {
    console.error('❌ Error processing PayU response:', error)
    return NextResponse.redirect(new URL('/payment/failure?error=server-error', request.url))
  } finally {
    await prisma.$disconnect()
  }
}

// Manejar también GET requests para casos donde PayU usa GET
export async function GET(request: NextRequest) {
  console.log('🔔 PayU Response GET webhook received')
  
  try {
    const searchParams = request.nextUrl.searchParams
    const referenceCode = searchParams.get('referenceCode') || searchParams.get('reference_sale')
    const state = searchParams.get('lapTransactionState') || searchParams.get('transactionState')
    
    console.log('📄 PayU GET response params:', {
      referenceCode,
      state,
      allParams: Object.fromEntries(searchParams.entries())
    })
    
    if (!referenceCode) {
      console.log('❌ No reference code in PayU GET response')
      return NextResponse.redirect(new URL('/payment/failure?error=no-reference', request.url))
    }
    
    // Buscar el booking
    const booking = await prisma.booking.findFirst({
      where: { id: referenceCode },
      include: {
        payment: true,
        item: true
      }
    })
    
    if (!booking) {
      console.log('❌ Booking not found for reference:', referenceCode)
      return NextResponse.redirect(new URL('/payment/failure?error=booking-not-found', request.url))
    }
    
    // Redirigir según el estado
    let redirectUrl = '/payment/pending'
    
    switch (state) {
      case '4': // Aprobada
        redirectUrl = '/payment/success'
        console.log('✅ Payment approved:', referenceCode)
        break
      case '6': // Rechazada
      case '104': // Error
        redirectUrl = '/payment/failure'
        console.log('❌ Payment failed:', referenceCode)
        break
      case '7': // Pendiente
      case '15': // Pendiente
        redirectUrl = '/payment/pending'
        console.log('⏳ Payment pending:', referenceCode)
        break
      default:
        redirectUrl = '/payment/pending'
        console.log('❓ Unknown payment state:', state)
    }
    
    // Agregar parámetros a la URL de redirección
    const finalUrl = new URL(redirectUrl, request.url)
    finalUrl.searchParams.set('reference', referenceCode)
    finalUrl.searchParams.set('bookingId', booking.id)
    
    return NextResponse.redirect(finalUrl)
    
  } catch (error) {
    console.error('❌ Error processing PayU GET response:', error)
    return NextResponse.redirect(new URL('/payment/failure?error=server-error', request.url))
  } finally {
    await prisma.$disconnect()
  }
}
