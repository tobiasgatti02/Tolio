"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  Check, 
  X, 
  Eye, 
  Calendar, 
  Package, 
  Star, 
  MessageCircle,
  ChevronRight,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Notification {
  id: string
  type: string
  title: string
  content: string
  isRead: boolean
  createdAt: string
  bookingId?: string
  itemId?: string
  actionUrl?: string
  metadata?: any
}

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export default function NotificationsPanel({ isOpen, onClose, userId }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        // La API devuelve { notifications: [...] }
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([]) // Fallback a array vacío
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: 'PATCH'
      })
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleBookingAction = async (bookingId: string, action: 'confirm' | 'reject') => {
    try {
      const response = await fetch(`/api/booking/${bookingId}/${action}`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        fetchNotifications() // Refresh notifications
        alert(`Reserva ${action === 'confirm' ? 'confirmada' : 'rechazada'} exitosamente`)
      } else {
        alert('Error al procesar la reserva')
      }
    } catch (error) {
      console.error('Error processing booking:', error)
      alert('Error al procesar la reserva')
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      onClose()
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_REQUEST':
        return <Calendar className="w-5 h-5 text-blue-500" />
      case 'BOOKING_CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'BOOKING_CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'PAYMENT_RECEIVED':
        return <Package className="w-5 h-5 text-emerald-500" />
      case 'REVIEW_RECEIVED':
        return <Star className="w-5 h-5 text-yellow-500" />
      case 'MESSAGE_RECEIVED':
        return <MessageCircle className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="absolute right-4 top-16 w-96 bg-white rounded-lg shadow-xl max-h-96 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-80">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Cargando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No hay notificaciones
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0" onClick={() => handleNotificationClick(notification)}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </p>
                  </div>

                  {notification.actionUrl && (
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  )}
                </div>

                {/* Botones de acción para reservas pendientes */}
                {notification.type === 'BOOKING_REQUEST' && notification.bookingId && (
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBookingAction(notification.bookingId!, 'confirm')
                      }}
                      className="flex-1 bg-green-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBookingAction(notification.bookingId!, 'reject')
                      }}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => {
                router.push('/notifications')
                onClose()
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todas las notificaciones
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
