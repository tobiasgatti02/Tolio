import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { messageIds } = await request.json()

    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { message: "IDs de mensajes requeridos" },
        { status: 400 }
      )
    }

    // Marcar mensajes como leídos (solo los que son para el usuario actual)
    await prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        receiverId: session.user.id
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
