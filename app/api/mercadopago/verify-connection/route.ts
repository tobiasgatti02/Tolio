import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

/**
 * GET /api/mercadopago/verify-connection
 * 
 * Verifica el estado de conexión de MercadoPago del usuario actual
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        mercadopagoConnected: true,
        mercadopagoAccessToken: true,
        mercadopagoRefreshToken: true,
        mercadopagoUserId: true,
        mercadopagoConnectedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      connected: user.mercadopagoConnected || false,
      hasAccessToken: !!user.mercadopagoAccessToken,
      hasRefreshToken: !!user.mercadopagoRefreshToken,
      mercadopagoUserId: user.mercadopagoUserId,
      connectedAt: user.mercadopagoConnectedAt,
      // Solo mostrar primeros caracteres del token por seguridad
      accessTokenPreview: user.mercadopagoAccessToken 
        ? `${user.mercadopagoAccessToken.substring(0, 20)}...` 
        : null,
    })
  } catch (error) {
    console.error('Error verifying MercadoPago connection:', error)
    return NextResponse.json(
      { error: 'Error al verificar conexión' },
      { status: 500 }
    )
  }
}

// Forzar Node.js runtime
export const runtime = 'nodejs';

