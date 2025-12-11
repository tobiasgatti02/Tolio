import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { dlocalService } from '@/lib/dlocal-service'

/**
 * POST /api/payments/initialize
 * 
 * Inicializa un pago (materiales o servicio)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { bookingId, type, amount, materials } = body

        if (!bookingId || !type) {
            return NextResponse.json(
                { error: 'Faltan parámetros requeridos' },
                { status: 400 }
            )
        }

        // Buscar la reserva
        const booking = await prisma.serviceBooking.findUnique({
            where: { id: bookingId },
            include: {
                Service: true,
                User_ServiceBooking_clientIdToUser: true,
                User_ServiceBooking_providerIdToUser: true,
            },
        })

        if (!booking) {
            return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
        }

        const userId = session.user.id

        // Validar permisos según el tipo de pago
        if (type === 'MATERIAL') {
            // Solo el cliente puede iniciar pago de materiales
            if (booking.clientId !== userId) {
                return NextResponse.json(
                    { error: 'Solo el cliente puede pagar materiales' },
                    { status: 403 }
                )
            }

            // Verificar que exista solicitud de materiales
            const materialPayment = await prisma.materialPayment.findUnique({
                where: { serviceBookingId: bookingId },
            })

            if (!materialPayment) {
                return NextResponse.json(
                    { error: 'No hay solicitud de materiales para esta reserva' },
                    { status: 400 }
                )
            }

            if (materialPayment.status === 'COMPLETED') {
                return NextResponse.json(
                    { error: 'Los materiales ya fueron pagados' },
                    { status: 400 }
                )
            }

            // Crear pago en DLocal
            const dlocalPayment = await dlocalService.createMaterialPayment({
                bookingId,
                providerId: booking.providerId,
                amount: materialPayment.totalAmount,
                materials: materialPayment.materials as Array<{ name: string; price: number }>,
                clientEmail: booking.User_ServiceBooking_clientIdToUser.email,
                clientName: `${booking.User_ServiceBooking_clientIdToUser.firstName} ${booking.User_ServiceBooking_clientIdToUser.lastName}`,
            })

            // Crear registro de pago en DB
            const payment = await prisma.payment.create({
                data: {
                    serviceBookingId: bookingId,
                    type: 'MATERIAL',
                    amount: materialPayment.totalAmount,
                    platformFee: 0, // Sin comisión en materiales
                    providerAmount: materialPayment.totalAmount,
                    status: 'PENDING',
                    dlocalPaymentId: dlocalPayment.id,
                    dlocalOrderId: dlocalPayment.order_id,
                    description: 'Pago de materiales',
                },
            })

            // Actualizar MaterialPayment con el paymentId
            await prisma.materialPayment.update({
                where: { id: materialPayment.id },
                data: {
                    paymentId: payment.id,
                    status: 'PENDING',
                },
            })

            return NextResponse.json({
                paymentId: payment.id,
                dlocalPaymentId: dlocalPayment.id,
                checkoutUrl: dlocalPayment.redirect_url,
                amount: materialPayment.totalAmount,
            })
        } else if (type === 'SERVICE') {
            // Solo el cliente puede iniciar pago de servicio
            if (booking.clientId !== userId) {
                return NextResponse.json(
                    { error: 'Solo el cliente puede pagar el servicio' },
                    { status: 403 }
                )
            }

            // Verificar que la reserva esté completada
            if (booking.status !== 'COMPLETED') {
                return NextResponse.json(
                    { error: 'El servicio debe estar completado para proceder al pago' },
                    { status: 400 }
                )
            }

            // Verificar que no se haya pagado ya
            if (booking.servicePaid) {
                return NextResponse.json(
                    { error: 'El servicio ya fue pagado' },
                    { status: 400 }
                )
            }

            // Calcular montos
            const serviceAmount = booking.customPrice || (booking.Service.pricePerHour! * (booking.hours || 1))
            const materialsAmount = booking.materialsPaid ?
                (await prisma.materialPayment.findUnique({ where: { serviceBookingId: bookingId } }))?.totalAmount || 0
                : 0

            const platformFeePercentage = parseFloat(process.env.MARKETPLACE_FEE_PERCENTAGE || '2')

            // Crear pago en DLocal
            const dlocalPayment = await dlocalService.createServicePayment({
                bookingId,
                providerId: booking.providerId,
                serviceAmount,
                materialsAmount,
                platformFeePercentage,
                clientEmail: booking.User_ServiceBooking_clientIdToUser.email,
                clientName: `${booking.User_ServiceBooking_clientIdToUser.firstName} ${booking.User_ServiceBooking_clientIdToUser.lastName}`,
            })

            const totalAmount = serviceAmount + materialsAmount
            const platformFee = serviceAmount * (platformFeePercentage / 100)
            const providerAmount = totalAmount - platformFee

            // Crear registro de pago en DB
            const payment = await prisma.payment.create({
                data: {
                    serviceBookingId: bookingId,
                    type: 'SERVICE',
                    amount: totalAmount,
                    platformFee,
                    providerAmount,
                    status: 'PENDING',
                    dlocalPaymentId: dlocalPayment.id,
                    dlocalOrderId: dlocalPayment.order_id,
                    description: 'Pago de servicio completado',
                    metadata: {
                        serviceAmount,
                        materialsAmount,
                        platformFeePercentage,
                    },
                },
            })

            return NextResponse.json({
                paymentId: payment.id,
                dlocalPaymentId: dlocalPayment.id,
                checkoutUrl: dlocalPayment.redirect_url,
                breakdown: {
                    serviceAmount,
                    materialsAmount,
                    total: totalAmount,
                    platformFee,
                },
            })
        } else {
            return NextResponse.json({ error: 'Tipo de pago inválido' }, { status: 400 })
        }
    } catch (error) {
        console.error('Error initializing payment:', error)
        return NextResponse.json(
            { error: 'Error al inicializar el pago', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
