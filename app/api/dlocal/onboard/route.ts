import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { dlocalService } from '@/lib/dlocal-service'

/**
 * POST /api/dlocal/onboard
 * 
 * Registra al usuario actual como proveedor en DLocal
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const userId = session.user.id

        // Obtener datos del usuario
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                dlocalAccountId: true,
                dlocalOnboarded: true,
            },
        })

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        // Verificar si ya está registrado
        if (user.dlocalAccountId && user.dlocalOnboarded) {
            return NextResponse.json({
                message: 'Ya estás registrado en DLocal',
                dlocalAccountId: user.dlocalAccountId,
                onboarded: true,
            })
        }

        // DLocal Go no requiere registro de proveedores
        // Simplemente marcamos al usuario como onboarded
        const dlocalUser = {
            id: `dlocal_${userId}_${Date.now()}`,
            type: 'INDIVIDUAL',
            email: user.email,
            country: 'AR',
            status: 'VERIFIED',
        }

        // Actualizar usuario con datos simulados de DLocal
        await prisma.user.update({
            where: { id: userId },
            data: {
                dlocalAccountId: dlocalUser.id,
                dlocalUserId: dlocalUser.id,
                dlocalOnboarded: true,
            },
        })

        return NextResponse.json({
            message: 'Cuenta de DLocal creada exitosamente',
            dlocalAccountId: dlocalUser.id,
            onboarded: true,
        })
    } catch (error) {
        console.error('Error onboarding to DLocal:', error)
        return NextResponse.json(
            { error: 'Error al registrarse en DLocal' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/dlocal/onboard
 * 
 * Obtiene el estado de DLocal del usuario actual
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                dlocalAccountId: true,
                dlocalOnboarded: true,
                dlocalKycStatus: true,
            },
        })

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        return NextResponse.json({
            dlocalAccountId: user.dlocalAccountId,
            onboarded: user.dlocalOnboarded,
            kycStatus: user.dlocalKycStatus,
        })
    } catch (error) {
        console.error('Error getting DLocal status:', error)
        return NextResponse.json(
            { error: 'Error al obtener estado de DLocal' },
            { status: 500 }
        )
    }
}
