import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { userId } = await params

    // Obtener mensajes entre el usuario actual y el usuario específico
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: userId
          },
          {
            senderId: userId,
            receiverId: session.user.id
          }
        ]
      },
      include: {
        User_Message_senderIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Convertir dates a strings y mapear nombres de campos para el frontend
    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      isRead: message.isRead,
      senderId: message.senderId,
      receiverId: message.receiverId,
      bookingId: message.bookingId,
      createdAt: message.createdAt.toISOString(),
      sender: {
        id: message.User_Message_senderIdToUser.id,
        firstName: message.User_Message_senderIdToUser.firstName,
        lastName: message.User_Message_senderIdToUser.lastName,
        profileImage: message.User_Message_senderIdToUser.profileImage
      }
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
