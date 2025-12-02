import prisma from "@/lib/prisma"
import { DashboardStats, DashboardItem, DashboardBooking, DashboardReview, DashboardNotification } from './types'



export class DashboardService {
  
  static async getUserStats(userId: string): Promise<DashboardStats> {
    try {
      const [
        totalItems,
        userBookings,
        userReviews,
        notifications
      ] = await Promise.all([
        // Total de artículos del usuario
        prisma.item.count({
          where: { ownerId: userId }
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
            totalPrice: true,
            borrowerId: true
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
      const completedBookings = userBookings.filter(b => b.status === 'COMPLETED').length
      const pendingBookings = userBookings.filter(b => b.status === 'PENDING').length
      
      // Ganancias (como prestador)
      const totalEarnings = userBookings
        .filter(b => b.status === 'COMPLETED' && b.borrowerId !== userId)
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
      
      // Gastos (como prestatario)
      const totalSpent = userBookings
        .filter(b => b.status === 'COMPLETED' && b.borrowerId === userId)
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0)

      // Ganancias de hoy
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayEarnings = userBookings
        .filter(b => b.status === 'COMPLETED' && b.borrowerId !== userId)
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0)

      // Ganancias del mes
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthlyEarnings = userBookings
        .filter(b => b.status === 'COMPLETED' && b.borrowerId !== userId)
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0)

      const averageRating = userReviews.length > 0 
        ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length 
        : 0

      const trustScore = Math.min(100, Math.max(0, averageRating * 20))

      return {
        totalEarnings,
        totalSpent,
        activeBookings,
        totalItems,
        averageRating,
        completedBookings,
        pendingBookings,
        trustScore,
        notifications,
        todayEarnings,
        monthlyEarnings
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      throw new Error('Failed to fetch user stats')
    }
  }

  static async getUserItems(userId: string): Promise<DashboardItem[]> {
    try {
      const items = await prisma.item.findMany({
        where: { ownerId: userId },
        include: {
          bookings: {
            select: {
              status: true,
              totalPrice: true
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
        subcategoria: item.subcategory || undefined,
        precioPorDia: item.price,
        status: item.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE' as any,
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
    try {
      let statusFilter = {}
      
      if (filter === 'active') {
        statusFilter = { status: { in: ['PENDING', 'CONFIRMED'] } }
      } else if (filter === 'completed') {
        statusFilter = { status: 'COMPLETED' }
      }

      const bookings = await prisma.booking.findMany({
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

      return bookings.map(booking => {
        const isBorrower = booking.borrowerId === userId
        const hasReviewed = booking.review !== null
        
        return {
          id: booking.id,
          item: {
            id: booking.item.id,
            nombre: booking.item.title,
            imagenes: booking.item.images,
            precioPorDia: booking.item.price
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
          total: booking.totalPrice,
          status: booking.status as any,
          createdAt: booking.createdAt.toISOString(),
          canReview: booking.status === 'COMPLETED' && !hasReviewed,
          hasReviewed: hasReviewed,
          userRole: isBorrower ? 'borrower' : 'owner'
        }
      })
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      throw new Error('Failed to fetch user bookings')
    }
  }

  static async getUserReviews(userId: string): Promise<DashboardReview[]> {
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
        title: notification.type.replace(/_/g, ' ').toLowerCase(),
        message: notification.content,
        read: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
        relatedBookingId: undefined,
        relatedItemId: undefined
      }))
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw new Error('Failed to fetch notifications')
    }
  }

  static async createNotification(data: {
    userId: string
    type: any
    content: string
  }): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
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
