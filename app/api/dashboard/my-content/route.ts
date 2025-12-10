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
        Booking: {
          select: {
            status: true,
            startDate: true,
            endDate: true
          }
        },
        Review: {
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
        ServiceBooking: {
          select: {
            status: true,
            startDate: true,
            endDate: true
          }
        },
        ServiceReview: {
          select: {
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Formatear items
    const formattedItems = items.map(item => {
      const activeBookings = item.Booking.filter((b: any) => ['PENDING', 'CONFIRMED'].includes(b.status))
      const hasActiveBooking = activeBookings.some((booking: any) => {
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
        averageRating: item.Review.length > 0 
          ? item.Review.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / item.Review.length 
          : undefined,
        reviewCount: item.Review.length,
        bookingsCount: item.Booking.length,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      }
    })

    // Formatear servicios
    const formattedServices = services.map(service => {
      const activeBookings = service.ServiceBooking.filter((b: any) => ['PENDING', 'CONFIRMED'].includes(b.status))
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
        averageRating: service.ServiceReview.length > 0 
          ? service.ServiceReview.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / service.ServiceReview.length 
          : undefined,
        reviewCount: service.ServiceReview.length,
        bookingsCount: service.ServiceBooking.length,
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
