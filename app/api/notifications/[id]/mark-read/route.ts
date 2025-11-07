import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { prisma } from '@/lib/utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: notificationId } = await params

    // Verificar que la notificación pertenece al usuario
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notificación no encontrada' }, { status: 404 })
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Marcar como leída
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    })

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Error al marcar la notificación como leída' },
      { status: 500 }
    )
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
