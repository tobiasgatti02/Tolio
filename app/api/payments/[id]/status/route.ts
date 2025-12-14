import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

/**
 * GET /api/payments/[id]/status
 * 
 * Obtiene el estado actual de un pago
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { id: paymentId } = await params

        // Buscar el pago
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                serviceBooking: {
                    select: {
                        clientId: true,
                        providerId: true,
                    },
                },
            },
        })

        if (!payment) {
            return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
        }

        // Verificar que el usuario tenga permiso para ver este pago
        const userId = session.user.id
        if (
            payment.serviceBooking.clientId !== userId &&
            payment.serviceBooking.providerId !== userId
        ) {
            return NextResponse.json(
                { error: 'No tienes permiso para ver este pago' },
                { status: 403 }
            )
        }

        // Obtener preference ID desde metadata si existe
        const metadata = payment.metadata as any
        const mercadopagoPreferenceId = metadata?.mercadopagoPreferenceId || null

        return NextResponse.json({
            id: payment.id,
            type: payment.type,
            amount: payment.amount,
            status: payment.status,
            platformFee: payment.platformFee,
            providerAmount: payment.providerAmount,
            mercadopagoPreferenceId,
            createdAt: payment.createdAt,
            paidAt: payment.paidAt,
        })
    } catch (error) {
        console.error('Error fetching payment status:', error)
        return NextResponse.json(
            { error: 'Error al obtener el estado del pago' },
            { status: 500 }
        )
    }
}
