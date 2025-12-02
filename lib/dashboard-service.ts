import { PrismaClient } from '@prisma/client'
import { DashboardStats, DashboardItem, DashboardBooking, DashboardReview, DashboardNotification } from './types'
import { ERROR_MESSAGES, DASHBOARD_CONFIG } from './dashboard-constants'

const prisma = new PrismaClient()

// Map status from English (database) to Spanish (frontend)
function mapStatusToSpanish(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'PENDIENTE',
    'CONFIRMED': 'CONFIRMADA',
    'COMPLETED': 'COMPLETADA',
    'CANCELLED': 'CANCELADA',
    'IN_PROGRESS': 'EN_PROGRESO'
  }
  return statusMap[status] || status
}

// Helper function to calculate total price for a booking
function calculateBookingPrice(dailyPrice: number, startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const subtotal = dailyPrice * diffDays
  const serviceFee = subtotal * 0.1 // 10% service fee
  return subtotal + serviceFee
}

export class DashboardService {
  
  static async getUserStats(userId: string): Promise<DashboardStats> {
    if (!userId || typeof userId !== 'string') {
      throw new Error(ERROR_MESSAGES.INVALID_USER_ID)
    }

    try {
      const [
        totalItems,
        totalServices,
        userBookings,
        userReviews,
        notifications
      ] = await Promise.all([
        // Total de artículos del usuario
        prisma.item.count({
          where: { ownerId: userId }
        }),
        
        // Total de servicios del usuario
        prisma.service.count({
          where: { providerId: userId }
        }),
        
        // Reservas del usuario
        prisma.booking.findMany({
          where: {
            OR: [
              { borrowerId: userId },
              { ownerId: userId }
            ]
          },
          select: {
            status: true,
            borrowerId: true,
            createdAt: true,
            startDate: true,
            endDate: true,
            item: {
              select: {
                price: true
              }
            }
          }
        }),
        
        // Reviews del usuario
        prisma.review.findMany({
          where: {
            OR: [
              { reviewerId: userId },
              { revieweeId: userId }
            ]
          },
          select: {
            rating: true
          }
        }),
        
        // Notificaciones no leídas
        prisma.notification.count({
          where: {
            userId: userId,
            isRead: false
          }
        })
      ])

      const activeBookings = userBookings.filter(b => b.status === 'CONFIRMED').length
      const pendingBookings = userBookings.filter(b => b.status === 'PENDING').length
      const completedBookings = userBookings.filter(b => b.status === 'COMPLETED').length
      
      // Ganancias (como prestador)
      const totalEarnings = userBookings
        .filter(b => b.status === 'COMPLETED' && b.borrowerId !== userId)
        .reduce((sum, b) => sum + calculateBookingPrice(b.item.price, b.startDate, b.endDate), 0)
      
      // Gastos (como prestatario)
      const totalSpent = userBookings
        .filter(b => b.status === 'COMPLETED' && b.borrowerId === userId)
        .reduce((sum, b) => sum + calculateBookingPrice(b.item.price, b.startDate, b.endDate), 0)

      // Ganancias de hoy
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayEarnings = userBookings
        .filter(b => b.status === 'COMPLETED' && b.borrowerId !== userId && new Date(b.createdAt) >= today)
        .reduce((sum, b) => sum + calculateBookingPrice(b.item.price, b.startDate, b.endDate), 0)

      // Ganancias del mes
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthlyEarnings = userBookings
        .filter(b => b.status === 'COMPLETED' && b.borrowerId !== userId && new Date(b.createdAt) >= monthStart)
        .reduce((sum, b) => sum + calculateBookingPrice(b.item.price, b.startDate, b.endDate), 0)

      const averageRating = userReviews.length > 0 
        ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length 
        : 0

      // Calcular trustScore basado en rating promedio, cantidad de reviews y bookings completados
      let trustScore: number = DASHBOARD_CONFIG.DEFAULT_TRUST_SCORE
      if (averageRating > 0) {
        trustScore = Math.min(
          DASHBOARD_CONFIG.MAX_TRUST_SCORE, 
          averageRating * DASHBOARD_CONFIG.TRUST_SCORE_WEIGHTS.RATING + 
          (userReviews.length / 10) * DASHBOARD_CONFIG.TRUST_SCORE_WEIGHTS.REVIEW_COUNT + 
          (completedBookings / 20) * DASHBOARD_CONFIG.TRUST_SCORE_WEIGHTS.BOOKING_COUNT
        )
      }

      return {
        totalItems: totalItems + totalServices, // Items + Services
        totalServices,
        activeBookings,
        pendingBookings,
        completedBookings,
        totalEarnings,
        trustScore: Math.round(trustScore * 10) / 10, // Redondear a 1 decimal
        notifications: notifications,
        todayEarnings,
        monthlyEarnings,
        // Campos adicionales para compatibilidad
        totalSpent,
        averageRating
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      throw new Error('Failed to fetch user stats')
    }
  }

  static async getUserItems(userId: string): Promise<DashboardItem[]> {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string')
    }

    try {
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

      return items.map(item => ({
        id: item.id,
        nombre: item.title,
        descripcion: item.description,
        categoria: item.category,
        subcategoria: undefined, // No hay subcategoría en el esquema actual
        precioPorDia: item.price,
        status: item.isAvailable ? 'DISPONIBLE' : 'NO_DISPONIBLE' as any,
        imagenes: item.images,
        ubicacion: item.location,
        averageRating: item.reviews.length > 0 
          ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length 
          : undefined,
        reviewCount: item.reviews.length > 0 ? item.reviews.length : undefined,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      }))
    } catch (error) {
      console.error('Error fetching user items:', error)
      throw new Error('Failed to fetch user items')
    }
  }

  static async getUserBookings(userId: string, filter?: 'all' | 'active' | 'completed'): Promise<DashboardBooking[]> {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string')
    }

    try {
      let statusFilter = {}
      
      if (filter === 'active') {
        statusFilter = { status: { in: ['PENDING', 'CONFIRMED'] } }
      } else if (filter === 'completed') {
        statusFilter = { status: 'COMPLETED' }
      }

      // Obtener reservas de items
      const itemBookings = await prisma.booking.findMany({
        where: {
          OR: [
            { borrowerId: userId },
            { ownerId: userId }
          ],
          ...statusFilter
        },
        include: {
          item: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true
            }
          },
          borrower: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          review: true
        },
        orderBy: { createdAt: 'desc' }
      })

      // Obtener reservas de servicios
      const serviceBookings = await prisma.serviceBooking.findMany({
        where: {
          OR: [
            { clientId: userId },
            { providerId: userId }
          ],
          ...statusFilter
        },
        include: {
          service: {
            select: {
              id: true,
              title: true,
              images: true,
              pricePerHour: true
            }
          },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          provider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          review: true
        },
        orderBy: { createdAt: 'desc' }
      })

      // Mapear reservas de items
      const mappedItemBookings: DashboardBooking[] = itemBookings.map(booking => {
        const isBorrower = booking.borrowerId === userId
        const hasReviewed = booking.review !== null
        const totalPrice = calculateBookingPrice(booking.item.price, booking.startDate, booking.endDate)
        
        return {
          id: booking.id,
          type: 'item' as const,
          item: {
            id: booking.item.id,
            nombre: booking.item.title,
            imagenes: booking.item.images,
            precioPorDia: booking.item.price,
            type: 'item'
          },
          borrower: isBorrower ? undefined : {
            id: booking.borrower.id,
            name: `${booking.borrower.firstName} ${booking.borrower.lastName}`.trim(),
            email: booking.borrower.email
          },
          owner: !isBorrower ? undefined : {
            id: booking.owner.id,
            name: `${booking.owner.firstName} ${booking.owner.lastName}`.trim(),
            email: booking.owner.email
          },
          fechaInicio: booking.startDate.toISOString(),
          fechaFin: booking.endDate.toISOString(),
          total: totalPrice,
          status: mapStatusToSpanish(booking.status) as any,
          createdAt: booking.createdAt.toISOString(),
          canReview: booking.status === 'COMPLETED' && !hasReviewed,
          hasReviewed: hasReviewed,
          userRole: isBorrower ? 'borrower' : 'owner'
        }
      })

      // Mapear reservas de servicios
      const mappedServiceBookings: DashboardBooking[] = serviceBookings.map(booking => {
        const isClient = booking.clientId === userId
        const hasReviewed = booking.review !== null
        const totalPrice = booking.service.pricePerHour || 0
        
        return {
          id: booking.id,
          type: 'service' as const,
          item: {
            id: booking.service.id,
            nombre: booking.service.title,
            imagenes: booking.service.images,
            precioPorDia: booking.service.pricePerHour || 0,
            type: 'service'
          },
          borrower: isClient ? undefined : {
            id: booking.client.id,
            name: `${booking.client.firstName} ${booking.client.lastName}`.trim(),
            email: booking.client.email
          },
          owner: !isClient ? undefined : {
            id: booking.provider.id,
            name: `${booking.provider.firstName} ${booking.provider.lastName}`.trim(),
            email: booking.provider.email
          },
          fechaInicio: booking.startDate.toISOString(),
          fechaFin: booking.startDate.toISOString(), // Servicios no tienen fecha fin
          total: totalPrice,
          status: mapStatusToSpanish(booking.status) as any,
          createdAt: booking.createdAt.toISOString(),
          canReview: booking.status === 'COMPLETED' && !hasReviewed,
          hasReviewed: hasReviewed,
          userRole: isClient ? 'borrower' : 'owner'
        }
      })

      // Combinar y ordenar por fecha de creación
      const allBookings = [...mappedItemBookings, ...mappedServiceBookings]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      return allBookings
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      throw new Error('Failed to fetch user bookings')
    }
  }

  static async getUserReviews(userId: string): Promise<DashboardReview[]> {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string')
    }

    try {
      const reviews = await prisma.review.findMany({
        where: { revieweeId: userId },
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          item: {
            select: {
              id: true,
              title: true,
              images: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment || undefined,
        item: {
          id: review.item.id,
          nombre: review.item.title,
          imagenes: review.item.images
        },
        reviewer: {
          id: review.reviewer.id,
          name: `${review.reviewer.firstName} ${review.reviewer.lastName}`.trim()
        },
        createdAt: review.createdAt.toISOString()
      }))
    } catch (error) {
      console.error('Error fetching user reviews:', error)
      throw new Error('Failed to fetch user reviews')
    }
  }

  static async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<DashboardNotification[]> {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string')
    }

    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: userId,
          ...(unreadOnly && { isRead: false })
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      })

      return notifications.map(notification => ({
        id: notification.id,
        type: notification.type as any,
        title: notification.title || notification.type.replace(/_/g, ' ').toLowerCase(),
        message: notification.content,
        read: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
        actionUrl: notification.actionUrl || undefined,
        relatedBookingId: notification.bookingId || undefined,
        relatedItemId: notification.itemId || undefined
      }))
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw new Error('Failed to fetch notifications')
    }
  }

  static async createNotification(data: {
    userId: string
    type: any
    title: string
    content: string
  }): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          content: data.content,
          isRead: false
        }
      })
    } catch (error) {
      console.error('Error creating notification:', error)
      throw new Error('Failed to create notification')
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw new Error('Failed to mark notification as read')
    }
  }

  static async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: { 
          userId: userId,
          isRead: false 
        },
        data: { isRead: true }
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw new Error('Failed to mark all notifications as read')
    }
  }
}
