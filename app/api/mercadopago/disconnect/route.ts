import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"



export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    // Limpiar los datos de MercadoPago del usuario
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        mercadopagoAccessToken: null,
        mercadopagoRefreshToken: null,
        mercadopagoUserId: null,
        mercadopagoConnected: false,
        mercadopagoConnectedAt: null,
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'MercadoPago desconectado correctamente' 
    })
    
  } catch (error) {
    console.error('Error al desconectar MercadoPago:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
