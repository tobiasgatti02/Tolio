import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"



export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    // Obtener items (herramientas)
    const items = await prisma.item.findMany({
      where: { ownerId: userId },
      include: {
        bookings: {
          select: {
            status: true,
            startDate: true,
            endDate: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Obtener servicios
    const services = await prisma.service.findMany({
      where: { providerId: userId },
      include: {
        bookings: {
          select: {
            status: true,
            startDate: true,
            endDate: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Formatear items
    const formattedItems = items.map(item => {
      const activeBookings = item.bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status))
      const hasActiveBooking = activeBookings.some(booking => {
        const now = new Date()
        const endDate = new Date(booking.endDate)
        return endDate >= now
      })

      return {
        id: item.id,
        type: 'item' as const,
        title: item.title,
        description: item.description,
        category: item.category,
        subcategory: item.subcategory,
        price: item.price,
        priceType: item.priceType || 'day',
        status: !item.isAvailable ? 'PAUSADO' : hasActiveBooking ? 'PRESTADO' : 'DISPONIBLE',
        images: item.images,
        location: item.location,
        averageRating: item.reviews.length > 0 
          ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length 
          : undefined,
        reviewCount: item.reviews.length,
        bookingsCount: item.bookings.length,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      }
    })

    // Formatear servicios
    const formattedServices = services.map(service => {
      const activeBookings = service.bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status))
      const hasActiveBooking = activeBookings.length > 0

      return {
        id: service.id,
        type: 'service' as const,
        title: service.title,
        description: service.description,
        category: service.category,
        subcategory: service.subcategory,
        price: service.pricePerHour,
        priceType: service.priceType,
        isProfessional: service.isProfessional,
        status: !service.isAvailable ? 'PAUSADO' : hasActiveBooking ? 'PRESTADO' : 'DISPONIBLE',
        images: service.images,
        location: service.location,
        serviceArea: service.serviceArea,
        averageRating: service.reviews.length > 0 
          ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length 
          : undefined,
        reviewCount: service.reviews.length,
        bookingsCount: service.bookings.length,
        createdAt: service.createdAt.toISOString(),
        updatedAt: service.updatedAt.toISOString()
      }
    })

    return NextResponse.json({ 
      items: formattedItems,
      services: formattedServices,
      total: formattedItems.length + formattedServices.length
    })
  } catch (error) {
    console.error('Error in dashboard my-content API:', error)
    return NextResponse.json(
      { message: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}
