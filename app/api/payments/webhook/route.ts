import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { dlocalService } from '@/lib/dlocal-service'
import { createNotification } from '@/lib/notification-helpers'

/**
 * POST /api/payments/webhook
 * 
 * Webhook de DLocal para actualizar estado de pagos
 */
export async function POST(request: NextRequest) {
    try {
        const signature = request.headers.get('X-Signature') || ''
        const body = await request.text()

        // Verificar firma del webhook
        if (!dlocalService.verifyWebhookSignature(signature, body)) {
            console.error('Invalid webhook signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const payload = JSON.parse(body)
        const webhookData = await dlocalService.processWebhook(payload)

        const { paymentId: dlocalPaymentId, status, bookingId, paymentType } = webhookData

        // Buscar el pago en nuestra DB
        const payment = await prisma.payment.findUnique({
            where: { dlocalPaymentId },
            include: {
                serviceBooking: {
                    include: {
                        Service: true,
                        User_ServiceBooking_clientIdToUser: true,
                        User_ServiceBooking_providerIdToUser: true,
                    },
                },
            },
        })

        if (!payment) {
            console.error(`Payment not found for DLocal ID: ${dlocalPaymentId}`)
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
        }

        // Mapear estados de DLocal a nuestros estados
        let newStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED' = 'PENDING'

        switch (status.toUpperCase()) {
            case 'PAID':
            case 'AUTHORIZED':
                newStatus = 'COMPLETED'
                break
            case 'PENDING':
                newStatus = 'PROCESSING'
                break
            case 'REJECTED':
            case 'CANCELLED':
                newStatus = 'FAILED'
                break
            case 'REFUNDED':
                newStatus = 'REFUNDED'
                break
            default:
                newStatus = 'PENDING'
        }

        // Actualizar el pago
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: newStatus,
                paidAt: newStatus === 'COMPLETED' ? new Date() : null,
            },
        })

        // Si el pago fue completado, actualizar la reserva
        if (newStatus === 'COMPLETED') {
            if (payment.type === 'MATERIAL') {
                // Actualizar MaterialPayment
                await prisma.materialPayment.updateMany({
                    where: { paymentId: payment.id },
                    data: {
                        status: 'COMPLETED',
                        paidAt: new Date(),
                    },
                })

                // Actualizar ServiceBooking
                await prisma.serviceBooking.update({
                    where: { id: payment.serviceBookingId },
                    data: {
                        materialsPaid: true,
                        totalPaid: {
                            increment: payment.amount,
                        },
                    },
                })

                // Notificar al proveedor
                await createNotification(
                    payment.serviceBooking.providerId,
                    'MATERIAL_PAYMENT_COMPLETED',
                    {
                        bookingId: payment.serviceBookingId,
                        serviceId: payment.serviceBooking.serviceId,
                        serviceTitle: payment.serviceBooking.Service.title,
                        amount: payment.amount,
                    }
                )

                // Notificar al cliente
                await createNotification(
                    payment.serviceBooking.clientId,
                    'PAYMENT_RECEIVED',
                    {
                        bookingId: payment.serviceBookingId,
                        serviceId: payment.serviceBooking.serviceId,
                        serviceTitle: payment.serviceBooking.Service.title,
                        amount: payment.amount,
                        type: 'materials',
                    }
                )
            } else if (payment.type === 'SERVICE') {
                // Actualizar ServiceBooking
                await prisma.serviceBooking.update({
                    where: { id: payment.serviceBookingId },
                    data: {
                        servicePaid: true,
                        totalPaid: {
                            increment: payment.amount,
                        },
                    },
                })

                // Notificar al proveedor
                await createNotification(
                    payment.serviceBooking.providerId,
                    'SERVICE_PAYMENT_COMPLETED',
                    {
                        bookingId: payment.serviceBookingId,
                        serviceId: payment.serviceBooking.serviceId,
                        serviceTitle: payment.serviceBooking.Service.title,
                        amount: payment.providerAmount,
                        platformFee: payment.platformFee,
                    }
                )

                // Notificar al cliente
                await createNotification(
                    payment.serviceBooking.clientId,
                    'PAYMENT_RECEIVED',
                    {
                        bookingId: payment.serviceBookingId,
                        serviceId: payment.serviceBooking.serviceId,
                        serviceTitle: payment.serviceBooking.Service.title,
                        amount: payment.amount,
                        type: 'service',
                    }
                )
            }
        }

        // Si el pago falló, notificar
        if (newStatus === 'FAILED') {
            await createNotification(
                payment.serviceBooking.clientId,
                'PAYMENT_RECEIVED', // Reutilizamos este tipo
                {
                    bookingId: payment.serviceBookingId,
                    serviceId: payment.serviceBooking.serviceId,
                    serviceTitle: payment.serviceBooking.Service.title,
                    amount: payment.amount,
                    type: payment.type === 'MATERIAL' ? 'materials_failed' : 'service_failed',
                }
            )
        }

        return NextResponse.json({ success: true, status: newStatus })
    } catch (error) {
        console.error('Error processing webhook:', error)
        return NextResponse.json(
            { error: 'Error processing webhook' },
            { status: 500 }
        )
    }
}
