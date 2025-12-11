import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

/**
 * GET /api/chat/bookings/[userId]
 * 
 * Obtiene los bookings activos entre el usuario actual y otro usuario
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { userId: otherUserId } = await params
        const currentUserId = session.user.id

        // Buscar bookings de servicios entre los dos usuarios
        const serviceBookings = await prisma.serviceBooking.findMany({
            where: {
                OR: [
                    // El usuario actual es el proveedor y el otro es el cliente
                    { providerId: currentUserId, clientId: otherUserId },
                    // El usuario actual es el cliente y el otro es el proveedor
                    { providerId: otherUserId, clientId: currentUserId },
                ],
                // Solo bookings activos (no cancelados)
                status: {
                    in: ['PENDING', 'CONFIRMED', 'COMPLETED']
                }
            },
            include: {
                Service: {
                    select: {
                        id: true,
                        title: true,
                        mayIncludeMaterials: true,
                        pricePerHour: true,
                        priceType: true,
                    }
                },
                materialPayment: true,
            },
            orderBy: { createdAt: 'desc' }
        })

        const bookings = serviceBookings.map(booking => {
            // Calcular precio total
            let totalPrice = booking.customPrice || 0
            if (!totalPrice && booking.Service) {
                const pricePerHour = booking.Service.pricePerHour || 0
                if (booking.Service.priceType === 'hour' && booking.hours) {
                    totalPrice = pricePerHour * booking.hours
                } else {
                    totalPrice = pricePerHour
                }
            }

            return {
                id: booking.id,
                status: booking.status,
                serviceId: booking.serviceId,
                serviceTitle: booking.Service?.title || 'Servicio',
                providerId: booking.providerId,
                clientId: booking.clientId,
                mayIncludeMaterials: booking.Service?.mayIncludeMaterials || false,
                materialsPaid: booking.materialPayment?.status === 'COMPLETED',
                servicePaid: booking.servicePaid,
                totalPrice,
            }
        })

        return NextResponse.json({ bookings })
    } catch (error) {
        console.error('Error fetching chat bookings:', error)
        return NextResponse.json(
            { error: 'Error al obtener reservas' },
            { status: 500 }
        )
    }
}
