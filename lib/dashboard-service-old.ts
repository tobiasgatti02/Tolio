import { PrismaClient } from '@prisma/client'
import { ItemStatus } from './types'

const prisma = new PrismaClient()

export interface DashboardStats {
  totalItems: number
  activeBookings: number
  pendingBookings: number
  completedBookings: number
  totalEarnings: number
  totalSpent: number
  trustScore: number
  notifications: number
}

export interface DashboardItem {
  id: string
  title: string
  images: string[]
  price: number
  isAvailable: boolean
  bookings: number
  earnings: number
  category: string
  createdAt: Date
}

export interface DashboardBooking {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  item: {
    id: string
    title: string
    images: string[]
    price: number
  }
  borrower: {
    id: string
    firstName: string
    profileImage?: string | null
  }
  owner: {
    id: string
    firstName: string
    profileImage?: string | null
  }
  startDate: Date
  endDate: Date
  totalAmount: number
  paymentStatus: 'PENDING' | 'PAID' | 'COMPLETED' | 'REFUNDED' | 'FAILED'
  createdAt: Date
  canReview: boolean
  hasReviewed: boolean
}

export interface DashboardReview {
  id: string
  rating: number
  comment: string
  reviewer: {
    id: string
    name: string
    avatar: string | null
  }
  item: {
    id: string
    title: string
    image: string
  }
  type: 'received' | 'given'
  createdAt: Date
  response: string | null
}

export interface NotificationItem {
  id: string
  type: 'BOOKING_REQUEST' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'PAYMENT_RECEIVED' | 'PAYMENT_PENDING' | 'REVIEW_RECEIVED' | 'MESSAGE_RECEIVED' | 'MUTUAL_REVIEW_REQUEST' | 'BOOKING_COMPLETED'
  content: string
  createdAt: Date
  isRead: boolean
}

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
              { item: { ownerId: userId } }
            ]
          },
          select: {
            status: true,
            total: true,
            borrowerId: true
          }
        }),
        
        // Reviews del usuario
        prisma.review.findMany({
          where: {
            OR: [
              { reviewerId: userId },
              { booking: { item: { ownerId: userId } } }
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
        .reduce((sum, b) => sum + (b.total || 0), 0)
      
      // Gastos (como prestatario)
      const totalSpent = userBookings
        .filter(b => b.status === 'COMPLETED' && b.borrowerId === userId)
        .reduce((sum, b) => sum + (b.total || 0), 0)

      const trustScore = userReviews.length > 0 
        ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length 
        : 5.0

      return {
        totalItems,
        activeBookings,
        pendingBookings,
        completedBookings,
        totalEarnings,
        totalSpent,
        trustScore,
        notifications
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
              total: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return items.map(item => ({
        id: item.id,
        nombre: item.nombre,
        descripcion: item.descripcion,
        categoria: item.categoria,
        subcategoria: item.subcategoria || undefined,
        precioPorDia: item.precioPorDia,
        status: item.status as ItemStatus,
        imagenes: item.imagenes,
        ubicacion: item.ubicacion,
        averageRating: undefined, // TODO: calcular promedio de reviews
        reviewCount: undefined, // TODO: contar reviews
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      }))

  static async getUserBookings(userId: string, filter?: 'all' | 'active' | 'completed'): Promise<DashboardBooking[]> {
    try {
      const whereClause: any = {
        OR: [
          { borrowerId: userId },
          { ownerId: userId }
        ]
      }

      // Aplicar filtros
      if (filter === 'active') {
        whereClause.status = { in: ['PENDING', 'CONFIRMED'] }
      } else if (filter === 'completed') {
        whereClause.status = 'COMPLETED'
      }

      const bookings = await prisma.booking.findMany({
        where: whereClause,
        include: {
          item: {
            include: {
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  profileImage: true
                }
              }
            }
          },
          borrower: {
            select: {
              id: true,
              firstName: true,
              profileImage: true
            }
          },
          owner: {
            select: {
              id: true,
              firstName: true,
              profileImage: true
            }
          },
          review: true,
          payment: {
            select: {
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return bookings.map(booking => ({
        id: booking.id,
        status: booking.status as any,
        item: {
          id: booking.item.id,
          title: booking.item.title,
          images: booking.item.images,
          price: booking.item.price
        },
        borrower: {
          id: booking.borrower.id,
          firstName: booking.borrower.firstName,
          profileImage: booking.borrower.profileImage
        },
        owner: {
          id: booking.owner.id,
          firstName: booking.owner.firstName,
          profileImage: booking.owner.profileImage
        },
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalAmount: booking.totalPrice || 0,
        paymentStatus: booking.payment?.status as any || 'PENDING',
        createdAt: booking.createdAt,
        canReview: booking.status === 'COMPLETED',
        hasReviewed: booking.review !== null
      }))
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      throw new Error('Failed to fetch user bookings')
    }
  }

  static async getUserReviews(userId: string): Promise<DashboardReview[]> {
    try {
      const [reviewsAsLender, reviewsAsBorrower] = await Promise.all([
        // Reviews recibidas como prestador
        prisma.review.findMany({
          where: {
            booking: {
              item: { ownerId: userId }
            }
          },
          include: {
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true
              }
            },
            booking: {
              include: {
                item: {
                  select: {
                    id: true,
                    title: true,
                    images: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        
        // Reviews hechas como prestatario
        prisma.review.findMany({
          where: { reviewerId: userId },
          include: {
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true
              }
            },
            booking: {
              include: {
                item: {
                  select: {
                    id: true,
                    title: true,
                    images: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      ])

      const allReviews: DashboardReview[] = [...reviewsAsLender, ...reviewsAsBorrower].map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        reviewer: {
          id: review.reviewer.id,
          name: `${review.reviewer.firstName} ${review.reviewer.lastName}`.trim(),
          avatar: review.reviewer.profileImage
        },
        item: {
          id: review.booking.item.id,
          title: review.booking.item.title,
          image: review.booking.item.images[0]
        },
        type: reviewsAsLender.some(r => r.id === review.id) ? 'received' : 'given',
        response: null
      }))

      return allReviews
    } catch (error) {
      console.error('Error fetching user reviews:', error)
      throw new Error('Failed to fetch user reviews')
    }
  }

  static async createNotification(data: {
    userId: string
    type: 'BOOKING_REQUEST' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'PAYMENT_RECEIVED' | 'PAYMENT_PENDING' | 'REVIEW_RECEIVED' | 'MESSAGE_RECEIVED' | 'MUTUAL_REVIEW_REQUEST' | 'BOOKING_COMPLETED'
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

  static async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<NotificationItem[]> {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: userId,
          ...(unreadOnly && { isRead: false })
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return notifications.map(notification => ({
        id: notification.id,
        type: notification.type as any,
        content: notification.content,
        createdAt: notification.createdAt,
        isRead: notification.isRead
      }))
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw new Error('Failed to fetch notifications')
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
