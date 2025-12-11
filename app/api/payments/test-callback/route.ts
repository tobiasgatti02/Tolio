import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/payments/test-callback
 * 
 * Callback de prueba para simular pagos exitosos en modo test
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')
    const type = searchParams.get('type')
    const amount = searchParams.get('amount')
    const bookingIdParam = searchParams.get('bookingId')

    if (!orderId || !type) {
        return NextResponse.redirect(new URL('/dashboard/bookings', request.url))
    }

    console.log('🧪 Test Payment Callback:', { orderId, type, amount, bookingIdParam })

    try {
        // Extraer bookingId del orderId
        // Formato: MAT-{uuid}-{timestamp} o SVC-{uuid}-{timestamp}
        // El UUID tiene 5 partes separadas por guiones: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        // Así que el bookingId es: orderId.split('-').slice(1, 6).join('-')
        let extractedBookingId = bookingIdParam
        
        if (!extractedBookingId && orderId) {
            const parts = orderId.split('-')
            // parts[0] = MAT o SVC
            // parts[1-5] = UUID del booking
            // parts[6] = timestamp
            if (parts.length >= 6) {
                extractedBookingId = parts.slice(1, 6).join('-')
            }
        }

        console.log('🧪 Extracted bookingId:', extractedBookingId)

        if (!extractedBookingId) {
            throw new Error('No se pudo extraer el bookingId del orderId')
        }

        if (type === 'MATERIAL') {
            // Actualizar MaterialPayment como completado
            const updateResult = await prisma.materialPayment.updateMany({
                where: {
                    serviceBookingId: extractedBookingId,
                },
                data: {
                    status: 'COMPLETED',
                    paidAt: new Date(),
                },
            })
            console.log('🧪 MaterialPayment updated:', updateResult)

            // Actualizar ServiceBooking
            await prisma.serviceBooking.update({
                where: { id: extractedBookingId },
                data: {
                    materialsPaid: true,
                },
            })
            console.log('🧪 ServiceBooking updated for materials')
        } else if (type === 'SERVICE') {
            // Actualizar ServiceBooking como pagado
            await prisma.serviceBooking.update({
                where: { id: extractedBookingId },
                data: {
                    servicePaid: true,
                },
            })
            console.log('🧪 ServiceBooking updated for service payment')
        }

        // Redirigir al dashboard de bookings
        return NextResponse.redirect(
            new URL(`/dashboard/bookings/${extractedBookingId}?payment=success`, request.url)
        )
    } catch (error) {
        console.error('Error in test callback:', error)
        return NextResponse.redirect(
            new URL(`/dashboard/bookings?payment=error`, request.url)
        )
    }
}
