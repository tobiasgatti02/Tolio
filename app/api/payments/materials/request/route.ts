import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { createNotification } from '@/lib/notification-helpers'

/**
 * POST /api/payments/materials/request
 * 
 * El proveedor solicita pago anticipado de materiales
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { bookingId, materials } = body

        if (!bookingId || !materials || !Array.isArray(materials)) {
            return NextResponse.json(
                { error: 'Faltan parámetros requeridos' },
                { status: 400 }
            )
        }

        // Validar formato de materiales
        for (const material of materials) {
            if (!material.name || typeof material.price !== 'number' || material.price <= 0) {
                return NextResponse.json(
                    { error: 'Formato de materiales inválido' },
                    { status: 400 }
                )
            }
        }

        const userId = session.user.id

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

        // Verificar que el usuario sea el proveedor
        if (booking.providerId !== userId) {
            return NextResponse.json(
                { error: 'Solo el proveedor puede solicitar pago de materiales' },
                { status: 403 }
            )
        }

        // Verificar que la reserva esté confirmada
        if (booking.status !== 'CONFIRMED') {
            return NextResponse.json(
                { error: 'La reserva debe estar confirmada para solicitar materiales' },
                { status: 400 }
            )
        }

        // Verificar que el servicio permita materiales
        if (!booking.Service.mayIncludeMaterials) {
            return NextResponse.json(
                { error: 'Este servicio no permite costos de materiales' },
                { status: 400 }
            )
        }

        // Verificar que no exista ya una solicitud de materiales
        const existingMaterialPayment = await prisma.materialPayment.findUnique({
            where: { serviceBookingId: bookingId },
        })

        if (existingMaterialPayment) {
            return NextResponse.json(
                { error: 'Ya existe una solicitud de materiales para esta reserva' },
                { status: 400 }
            )
        }

        // Calcular total
        const totalAmount = materials.reduce((sum, m) => sum + m.price, 0)

        // Crear solicitud de pago de materiales
        const materialPayment = await prisma.materialPayment.create({
            data: {
                serviceBookingId: bookingId,
                materials: materials,
                totalAmount,
                status: 'PENDING',
            },
        })

        // Crear notificación para el cliente
        await createNotification(
            booking.clientId,
            'MATERIAL_PAYMENT_REQUESTED',
            {
                bookingId,
                serviceId: booking.serviceId,
                serviceTitle: booking.Service.title,
                totalAmount,
                materials,
            }
        )

        // Crear mensaje en el chat con el componente de pago
        await prisma.message.create({
            data: {
                id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                content: JSON.stringify({
                    type: 'material_payment_request',
                    materialPaymentId: materialPayment.id,
                    materials,
                    totalAmount,
                }),
                senderId: userId,
                receiverId: booking.clientId,
                bookingId: bookingId,
            },
        })

        return NextResponse.json({
            materialPaymentId: materialPayment.id,
            totalAmount,
            message: 'Solicitud de pago de materiales creada exitosamente',
        })
    } catch (error) {
        console.error('Error requesting material payment:', error)
        return NextResponse.json(
            { error: 'Error al solicitar pago de materiales' },
            { status: 500 }
        )
    }
}
