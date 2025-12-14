import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { createServicePaymentPreference, createPaymentPreference } from '@/lib/mercadopago'

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
                User_ServiceBooking_clientIdToUser: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                User_ServiceBooking_providerIdToUser: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        mercadopagoConnected: true,
                        mercadopagoAccessToken: true,
                        mercadopagoUserId: true,
                    },
                },
            },
        })

        if (!booking) {
            return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
        }

        const userId = session.user.id
        
        // Debug: Verificar datos del proveedor
        console.log('[Payment Initialize] Booking found:', {
            bookingId: booking.id,
            providerId: booking.providerId,
            clientId: booking.clientId,
            currentUserId: userId,
        })
        
        console.log('[Payment Initialize] Provider data:', {
            providerId: booking.User_ServiceBooking_providerIdToUser.id,
            email: booking.User_ServiceBooking_providerIdToUser.email,
            mercadopagoConnected: booking.User_ServiceBooking_providerIdToUser.mercadopagoConnected,
            hasAccessToken: !!booking.User_ServiceBooking_providerIdToUser.mercadopagoAccessToken,
            accessTokenLength: booking.User_ServiceBooking_providerIdToUser.mercadopagoAccessToken?.length || 0,
        })

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

            // Verificar que el proveedor tenga cuenta de MercadoPago configurada
            const provider = booking.User_ServiceBooking_providerIdToUser
            
            // Verificación adicional: consultar directamente desde la DB para evitar problemas de caché
            const providerFromDB = await prisma.user.findUnique({
                where: { id: booking.providerId },
                select: {
                    id: true,
                    email: true,
                    mercadopagoConnected: true,
                    mercadopagoAccessToken: true,
                    mercadopagoUserId: true,
                },
            })
            
            console.log('[Payment Initialize] Provider MP status (MATERIAL):', {
                providerId: provider.id,
                fromBooking: {
                    mercadopagoConnected: provider.mercadopagoConnected,
                    hasAccessToken: !!provider.mercadopagoAccessToken,
                },
                fromDB: {
                    mercadopagoConnected: providerFromDB?.mercadopagoConnected,
                    hasAccessToken: !!providerFromDB?.mercadopagoAccessToken,
                },
            })
            
            // Usar datos de la DB directa como fuente de verdad
            const finalProvider = providerFromDB || provider
            
            if (!finalProvider.mercadopagoConnected || !finalProvider.mercadopagoAccessToken) {
                // Verificar si el usuario actual es el proveedor
                const isCurrentUserProvider = session.user.id === booking.providerId
                
                return NextResponse.json(
                    { 
                        error: isCurrentUserProvider 
                            ? 'Debes conectar tu cuenta de MercadoPago en Configuración → Pagos antes de recibir pagos'
                            : 'El proveedor debe conectar su cuenta de MercadoPago antes de recibir pagos de materiales',
                        providerId: finalProvider.id,
                        providerEmail: finalProvider.email,
                        currentUserId: session.user.id,
                        isProvider: isCurrentUserProvider,
                        debug: {
                            connected: finalProvider.mercadopagoConnected,
                            hasToken: !!finalProvider.mercadopagoAccessToken,
                        }
                    },
                    { status: 400 }
                )
            }

            // Crear preferencia de pago en MercadoPago
            // Los materiales van 100% al proveedor (sin comisión del marketplace)
            const preference = await createPaymentPreference({
                title: `Materiales - Reserva ${bookingId.substring(0, 8)}`,
                quantity: 1,
                unit_price: materialPayment.totalAmount,
                bookingId: bookingId,
                userId: booking.clientId,
                itemId: `material-${materialPayment.id}`,
                ownerAccessToken: finalProvider.mercadopagoAccessToken || undefined,
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
                    description: 'Pago de materiales',
                    metadata: {
                        mercadopagoPreferenceId: preference.id,
                        paymentProvider: 'mercadopago',
                    },
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
                preferenceId: preference.id,
                checkoutUrl: preference.init_point || preference.sandbox_init_point,
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

            // Verificar que el proveedor tenga cuenta de MercadoPago configurada
            const provider = booking.User_ServiceBooking_providerIdToUser
            
            // Verificación adicional: consultar directamente desde la DB para evitar problemas de caché
            const providerFromDB = await prisma.user.findUnique({
                where: { id: booking.providerId },
                select: {
                    id: true,
                    email: true,
                    mercadopagoConnected: true,
                    mercadopagoAccessToken: true,
                    mercadopagoUserId: true,
                },
            })
            
            console.log('[Payment Initialize] Provider MP status (SERVICE):', {
                providerId: provider.id,
                fromBooking: {
                    mercadopagoConnected: provider.mercadopagoConnected,
                    hasAccessToken: !!provider.mercadopagoAccessToken,
                },
                fromDB: {
                    mercadopagoConnected: providerFromDB?.mercadopagoConnected,
                    hasAccessToken: !!providerFromDB?.mercadopagoAccessToken,
                },
            })
            
            // Usar datos de la DB directa como fuente de verdad
            const finalProvider = providerFromDB || provider
            
            if (!finalProvider.mercadopagoConnected || !finalProvider.mercadopagoAccessToken) {
                // Verificar si el usuario actual es el proveedor
                const isCurrentUserProvider = session.user.id === booking.providerId
                
                return NextResponse.json(
                    { 
                        error: isCurrentUserProvider 
                            ? 'Debes conectar tu cuenta de MercadoPago en Configuración → Pagos antes de recibir pagos'
                            : 'El proveedor debe conectar su cuenta de MercadoPago antes de recibir pagos de servicios',
                        providerId: finalProvider.id,
                        providerEmail: finalProvider.email,
                        currentUserId: session.user.id,
                        isProvider: isCurrentUserProvider,
                        debug: {
                            connected: finalProvider.mercadopagoConnected,
                            hasToken: !!finalProvider.mercadopagoAccessToken,
                        }
                    },
                    { status: 400 }
                )
            }

            const platformFeePercentage = parseFloat(process.env.MARKETPLACE_FEE_PERCENTAGE || '2')
            const totalAmount = serviceAmount + materialsAmount
            const platformFee = Math.round(serviceAmount * (platformFeePercentage / 100) * 100) / 100
            const providerAmount = totalAmount - platformFee

            // Crear preferencia de pago en MercadoPago con split payment
            const preference = await createServicePaymentPreference({
                bookingId: bookingId,
                serviceAmount: serviceAmount,
                materialsAmount: materialsAmount,
                clientEmail: booking.User_ServiceBooking_clientIdToUser.email,
                clientName: `${booking.User_ServiceBooking_clientIdToUser.firstName} ${booking.User_ServiceBooking_clientIdToUser.lastName}`,
                providerAccessToken: finalProvider.mercadopagoAccessToken || undefined,
            })

            // Crear registro de pago en DB
            const payment = await prisma.payment.create({
                data: {
                    serviceBookingId: bookingId,
                    type: 'SERVICE',
                    amount: totalAmount,
                    platformFee,
                    providerAmount,
                    status: 'PENDING',
                    description: 'Pago de servicio completado',
                    metadata: {
                        mercadopagoPreferenceId: preference.id,
                        paymentProvider: 'mercadopago',
                        serviceAmount,
                        materialsAmount,
                        platformFeePercentage,
                    },
                },
            })

            return NextResponse.json({
                paymentId: payment.id,
                preferenceId: preference.id,
                checkoutUrl: preference.init_point || preference.sandbox_init_point,
                breakdown: {
                    serviceAmount,
                    materialsAmount,
                    total: totalAmount,
                    platformFee,
                    providerAmount,
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
