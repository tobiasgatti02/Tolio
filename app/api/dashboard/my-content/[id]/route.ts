import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RouteParams {
  params: {
    id: string
  }
}

// PATCH - Pausar/Reactivar item o servicio
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const { type, isAvailable } = await request.json()

    if (type === 'item') {
      // Verificar que el item pertenezca al usuario
      const item = await prisma.item.findUnique({
        where: { id },
        select: { ownerId: true }
      })

      if (!item || item.ownerId !== session.user.id) {
        return NextResponse.json({ message: "Item no encontrado o no autorizado" }, { status: 404 })
      }

      // Actualizar item
      const updatedItem = await prisma.item.update({
        where: { id },
        data: { isAvailable }
      })

      return NextResponse.json({ 
        success: true, 
        message: isAvailable ? "Herramienta reactivada" : "Herramienta pausada",
        item: updatedItem 
      })
    } else if (type === 'service') {
      // Verificar que el servicio pertenezca al usuario
      const service = await prisma.service.findUnique({
        where: { id },
        select: { providerId: true }
      })

      if (!service || service.providerId !== session.user.id) {
        return NextResponse.json({ message: "Servicio no encontrado o no autorizado" }, { status: 404 })
      }

      // Actualizar servicio
      const updatedService = await prisma.service.update({
        where: { id },
        data: { isAvailable }
      })

      return NextResponse.json({ 
        success: true, 
        message: isAvailable ? "Servicio reactivado" : "Servicio pausado",
        service: updatedService 
      })
    }

    return NextResponse.json({ message: "Tipo inválido" }, { status: 400 })
  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json(
      { message: "Error al actualizar" }, 
      { status: 500 }
    )
  }
}

// DELETE - Eliminar item o servicio
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type === 'item') {
      // Verificar que el item pertenezca al usuario
      const item = await prisma.item.findUnique({
        where: { id },
        include: {
          bookings: {
            where: {
              status: { in: ['PENDING', 'CONFIRMED'] }
            }
          }
        }
      })

      if (!item || item.ownerId !== session.user.id) {
        return NextResponse.json({ message: "Item no encontrado o no autorizado" }, { status: 404 })
      }

      // Verificar que no tenga reservas activas
      if (item.bookings.length > 0) {
        return NextResponse.json({ 
          message: "No puedes eliminar una herramienta con reservas activas" 
        }, { status: 400 })
      }

      // Eliminar item
      await prisma.item.delete({ where: { id } })

      return NextResponse.json({ 
        success: true, 
        message: "Herramienta eliminada exitosamente" 
      })
    } else if (type === 'service') {
      // Verificar que el servicio pertenezca al usuario
      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          bookings: {
            where: {
              status: { in: ['PENDING', 'CONFIRMED'] }
            }
          }
        }
      })

      if (!service || service.providerId !== session.user.id) {
        return NextResponse.json({ message: "Servicio no encontrado o no autorizado" }, { status: 404 })
      }

      // Verificar que no tenga reservas activas
      if (service.bookings.length > 0) {
        return NextResponse.json({ 
          message: "No puedes eliminar un servicio con reservas activas" 
        }, { status: 400 })
      }

      // Eliminar servicio
      await prisma.service.delete({ where: { id } })

      return NextResponse.json({ 
        success: true, 
        message: "Servicio eliminado exitosamente" 
      })
    }

    return NextResponse.json({ message: "Tipo inválido" }, { status: 400 })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { message: "Error al eliminar" }, 
      { status: 500 }
    )
  }
}
