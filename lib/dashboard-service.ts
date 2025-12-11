import { DashboardStats, DashboardItem, DashboardBooking, DashboardReview, DashboardNotification } from './types'
import { ERROR_MESSAGES, DASHBOARD_CONFIG } from './dashboard-constants'
import prisma from './prisma'
import { v4 as uuidv4 } from 'uuid'

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
        itemReviewsAgg,
        serviceReviewsAgg,
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

        // Reservas del usuario (solo con items existentes)
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
            Item: {
              select: {
                price: true
              }
            }
          }
        }),

        // Reviews sobre LOS ITEMS que nos pertenecen
        prisma.review.aggregate({
          _count: { rating: true },
          _avg: { rating: true },
          _sum: { rating: true },
          where: {
            Item: { ownerId: userId }
          }
        }),
        // Reviews sobre LOS SERVICIOS que ofrecemos
        prisma.serviceReview.aggregate({
          _count: { rating: true },
          _avg: { rating: true },
          _sum: { rating: true },
          where: {
            Service: { providerId: userId }
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

      // Filtrar bookings válidos (con item existente)
      const validBookings = userBookings.filter(b => b.Item !== null)

      const activeBookings = validBookings.filter(b => b.status === 'CONFIRMED').length
      const pendingBookings = validBookings.filter(b => b.status === 'PENDING').length
      const completedBookings = validBookings.filter(b => b.status === 'COMPLETED').length

      // Ganancias (como prestador)
      const totalEarnings = validBookings
        .filter(b => b.status === 'COMPLETED' && b.borrowerId !== userId && b.Item)
        .reduce((sum, b) => sum + calculateBookingPrice(b.Item!.price, b.startDate, b.endDate), 0)

      // Gastos (como prestatario)
      const totalSpent = validBookings
        .filter(b => b.status === 'COMPLETED' && b.borrowerId === userId && b.Item)
        .reduce((sum, b) => sum + calculateBookingPrice(b.Item!.price, b.startDate, b.endDate), 0)

      // Ganancias de hoy
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayEarnings = validBookings
        .filter(b => b.status === 'COMPLETED' && b.borrowerId !== userId && b.Item && new Date(b.createdAt) >= today)
        .reduce((sum, b) => sum + calculateBookingPrice(b.Item!.price, b.startDate, b.endDate), 0)

      // Ganancias del mes
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthlyEarnings = validBookings
        .filter(b => b.status === 'COMPLETED' && b.borrowerId !== userId && b.Item && new Date(b.createdAt) >= monthStart)
        .reduce((sum, b) => sum + calculateBookingPrice(b.Item!.price, b.startDate, b.endDate), 0)

      // Combinar métricas de reviews de items y services para calcular promedio recibido
      const itemCount = itemReviewsAgg._count?.rating || 0
      const serviceCount = serviceReviewsAgg._count?.rating || 0
      const totalReviewsCount = itemCount + serviceCount
      const itemSum = itemReviewsAgg._sum?.rating || 0
      const serviceSum = serviceReviewsAgg._sum?.rating || 0
      const totalRatingSum = (itemSum || 0) + (serviceSum || 0)

      const averageRating = totalReviewsCount > 0 ? totalRatingSum / totalReviewsCount : 0

      // Calcular trustScore basado en rating promedio recibido en nuestras publicaciones,
      // además de contar número de reviews y bookings completados
      let trustScore: number = DASHBOARD_CONFIG.DEFAULT_TRUST_SCORE
      if (averageRating > 0) {
        trustScore = Math.min(
          DASHBOARD_CONFIG.MAX_TRUST_SCORE,
          averageRating * DASHBOARD_CONFIG.TRUST_SCORE_WEIGHTS.RATING +
          (totalReviewsCount / 10) * DASHBOARD_CONFIG.TRUST_SCORE_WEIGHTS.REVIEW_COUNT +
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
        averageRating: item.Review.length > 0
          ? item.Review.reduce((sum: number, r: any) => sum + r.rating, 0) / item.Review.length
          : undefined,
        reviewCount: item.Review.length > 0 ? item.Review.length : undefined,
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

      // Obtener reservas de items y servicios EN PARALELO para mejor rendimiento
      const [itemBookings, serviceBookings] = await Promise.all([
        prisma.booking.findMany({
          where: {
            OR: [
              { borrowerId: userId },
              { ownerId: userId }
            ],
            ...statusFilter
          },
          include: {
            Item: {
              select: {
                id: true,
                title: true,
                images: true,
                price: true
              }
            },
            User_Booking_borrowerIdToUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            User_Booking_ownerIdToUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            Review: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.serviceBooking.findMany({
          where: {
            OR: [
              { clientId: userId },
              { providerId: userId }
            ],
            ...statusFilter
          },
          include: {
            Service: {
              select: {
                id: true,
                title: true,
                images: true,
                pricePerHour: true,
                mayIncludeMaterials: true
              }
            },
            User_ServiceBooking_clientIdToUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            User_ServiceBooking_providerIdToUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            ServiceReview: true,
            materialPayment: true
          },
          orderBy: { createdAt: 'desc' }
        })
      ])

      // Mapear reservas de items (filtrar los que tienen item null por seguridad)
      const mappedItemBookings: DashboardBooking[] = itemBookings
        .filter(booking => booking.Item !== null)
        .map(booking => {
          const isBorrower = booking.borrowerId === userId
          const hasReviewed = booking.Review !== null
          const totalPrice = calculateBookingPrice(booking.Item!.price, booking.startDate, booking.endDate)

          return {
            id: booking.id,
            type: 'item' as const,
            item: {
              id: booking.Item!.id,
              nombre: booking.Item!.title,
              imagenes: booking.Item!.images,
              precioPorDia: booking.Item!.price,
              type: 'item'
            },
            borrower: isBorrower ? undefined : {
              id: booking.User_Booking_borrowerIdToUser.id,
              name: `${booking.User_Booking_borrowerIdToUser.firstName} ${booking.User_Booking_borrowerIdToUser.lastName}`.trim(),
              email: booking.User_Booking_borrowerIdToUser.email
            },
            owner: !isBorrower ? undefined : {
              id: booking.User_Booking_ownerIdToUser.id,
              name: `${booking.User_Booking_ownerIdToUser.firstName} ${booking.User_Booking_ownerIdToUser.lastName}`.trim(),
              email: booking.User_Booking_ownerIdToUser.email
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

      // Mapear reservas de servicios (filtrar los que tienen service null por seguridad)
      const mappedServiceBookings: DashboardBooking[] = serviceBookings
        .filter(booking => booking.Service !== null)
        .map(booking => {
          const isClient = booking.clientId === userId
          const hasReviewed = booking.ServiceReview !== null
          const totalPrice = booking.Service!.pricePerHour || 0
          const hasMaterialPayment = booking.materialPayment !== null
          const materialsPaid = hasMaterialPayment && booking.materialPayment?.status === 'COMPLETED'

          return {
            id: booking.id,
            type: 'service' as const,
            item: {
              id: booking.Service!.id,
              nombre: booking.Service!.title,
              imagenes: booking.Service!.images,
              precioPorDia: booking.Service!.pricePerHour || 0,
              type: 'service'
            },
            borrower: isClient ? undefined : {
              id: booking.User_ServiceBooking_clientIdToUser.id,
              name: `${booking.User_ServiceBooking_clientIdToUser.firstName} ${booking.User_ServiceBooking_clientIdToUser.lastName}`.trim(),
              email: booking.User_ServiceBooking_clientIdToUser.email
            },
            owner: !isClient ? undefined : {
              id: booking.User_ServiceBooking_providerIdToUser.id,
              name: `${booking.User_ServiceBooking_providerIdToUser.firstName} ${booking.User_ServiceBooking_providerIdToUser.lastName}`.trim(),
              email: booking.User_ServiceBooking_providerIdToUser.email
            },
            fechaInicio: booking.startDate.toISOString(),
            fechaFin: booking.startDate.toISOString(), // Servicios no tienen fecha fin
            total: totalPrice,
            status: mapStatusToSpanish(booking.status) as any,
            createdAt: booking.createdAt.toISOString(),
            canReview: booking.status === 'COMPLETED' && !hasReviewed,
            hasReviewed: hasReviewed,
            userRole: isClient ? 'borrower' : 'owner',
            mayIncludeMaterials: booking.Service!.mayIncludeMaterials ?? false,
            materialsPaid: materialsPaid,
            materialsAmount: booking.materialPayment?.totalAmount || 0,
            servicePaid: booking.servicePaid ?? false
          }
        })

      // Combinar y ordenar por fecha de creación
      const allBookings = [...mappedItemBookings, ...mappedServiceBookings]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      return allBookings
    } catch (error) {
      console.error('[DashboardService.getUserBookings] Error:', error instanceof Error ? error.message : String(error))
      console.error('[DashboardService.getUserBookings] Stack:', error instanceof Error ? error.stack : 'No stack trace')
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
          User_Review_reviewerIdToUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          Item: {
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
          id: review.Item.id,
          nombre: review.Item.title,
          imagenes: review.Item.images
        },
        reviewer: {
          id: review.User_Review_reviewerIdToUser.id,
          name: `${review.User_Review_reviewerIdToUser.firstName} ${review.User_Review_reviewerIdToUser.lastName}`.trim()
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
          id: uuidv4(),
          userId: data.userId,
          type: data.type,
          title: data.title,
          content: data.content,
          isRead: false
        }
      })
    } catch (error) {
      console.error('Error creating notification:', error instanceof Error ? error.message : String(error))
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
