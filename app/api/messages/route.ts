import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Enviar nuevo mensaje
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { content, receiverId, bookingId } = await request.json()

    if (!content || !receiverId) {
      return NextResponse.json(
        { message: "Contenido y destinatario son requeridos" },
        { status: 400 }
      )
    }

    // Verificar que el destinatario existe
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      return NextResponse.json(
        { message: "Usuario destinatario no encontrado" },
        { status: 404 }
      )
    }

    // Obtener datos del remitente
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true
      }
    })

    // Crear el mensaje
    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
        bookingId: bookingId || null
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      }
    })

    // Crear notificación para el receptor
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'MESSAGE_RECEIVED',
        title: 'Nuevo mensaje',
        content: `${sender?.firstName || 'Alguien'} te ha enviado un mensaje: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        actionUrl: `/messages/${session.user.id}`,
        metadata: {
          senderId: session.user.id,
          messageId: message.id
        }
      }
    })

    return NextResponse.json({
      ...message,
      createdAt: message.createdAt.toISOString()
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
