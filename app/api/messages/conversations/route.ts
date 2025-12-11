import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    // Obtener todas las conversaciones del usuario
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
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
        },
        User_Message_receiverIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Agrupar mensajes por conversación
    const conversationMap = new Map()

    for (const message of conversations) {
      const otherUser = message.senderId === session.user.id 
        ? message.User_Message_receiverIdToUser 
        : message.User_Message_senderIdToUser
      
      const conversationKey = otherUser.id
      
      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          id: conversationKey,
          otherUser,
          lastMessage: {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt.toISOString(),
            isRead: message.isRead
          },
          unreadCount: 0
        })
      }
    }

    // Calcular mensajes no leídos para cada conversación
    for (const [conversationKey, conversation] of conversationMap) {
      const unreadCount = await prisma.message.count({
        where: {
          senderId: conversationKey,
          receiverId: session.user.id,
          isRead: false
        }
      })
      conversation.unreadCount = unreadCount
    }

    const result = Array.from(conversationMap.values())
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching conversations:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
