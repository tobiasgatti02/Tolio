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
        select: {
          id: true,
          ownerId: true,
          bookings: {
            where: {
              status: { in: ['PENDING', 'CONFIRMED'] }
            },
            select: {
              id: true,
              status: true
            }
          }
        }
      })

      if (!item || item.ownerId !== session.user.id) {
        return NextResponse.json({ message: "Item no encontrado o no autorizado" }, { status: 404 })
      }

      // Verificar si el item está actualmente en uso (tiene reservas CONFIRMED)
      const isInUse = item.bookings.some(b => b.status === 'CONFIRMED')

      if (isInUse) {
        return NextResponse.json({
          message: "No puedes eliminar un artículo que está actualmente en uso o confirmado",
          code: "IN_USE"
        }, { status: 400 })
      }

      // Si tiene solo reservas PENDING, permitir eliminación con advertencia
      const hasPendingBookings = item.bookings.some(b => b.status === 'PENDING')

      if (hasPendingBookings) {
        // El frontend debe confirmar esta acción
        // Eliminar item y las reservas pendientes se eliminarán en cascada
        await prisma.item.delete({ where: { id } })

        return NextResponse.json({
          success: true,
          message: "Herramienta eliminada exitosamente junto con sus reservas pendientes"
        })
      }

      // No tiene reservas, eliminar directamente
      await prisma.item.delete({ where: { id } })

      return NextResponse.json({
        success: true,
        message: "Herramienta eliminada exitosamente"
      })
    } else if (type === 'service') {
      // Verificar que el servicio pertenezca al usuario
      const service = await prisma.service.findUnique({
        where: { id },
        select: {
          id: true,
          providerId: true,
          bookings: {
            where: {
              status: { in: ['PENDING', 'CONFIRMED'] }
            },
            select: {
              id: true,
              status: true
            }
          }
        }
      })

      if (!service || service.providerId !== session.user.id) {
        return NextResponse.json({ message: "Servicio no encontrado o no autorizado" }, { status: 404 })
      }

      // Verificar si el servicio está actualmente en uso (tiene reservas CONFIRMED)
      const isInUse = service.bookings.some(b => b.status === 'CONFIRMED')

      if (isInUse) {
        return NextResponse.json({
          message: "No puedes eliminar un servicio que está actualmente en uso o confirmado",
          code: "IN_USE"
        }, { status: 400 })
      }

      // Si tiene solo reservas PENDING, permitir eliminación con advertencia
      const hasPendingBookings = service.bookings.some(b => b.status === 'PENDING')

      if (hasPendingBookings) {
        // Eliminar servicio y las reservas pendientes se eliminarán en cascada
        await prisma.service.delete({ where: { id } })

        return NextResponse.json({
          success: true,
          message: "Servicio eliminado exitosamente junto con sus reservas pendientes"
        })
      }

      // No tiene reservas, eliminar directamente
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
