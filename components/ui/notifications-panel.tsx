"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/contexts/notifications-context'
import { 
  Bell, 
  X, 
  Calendar, 
  Package, 
  Star, 
  MessageCircle,
  ChevronRight,
  CheckCircle,
  XCircle,
  Loader2
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
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { refreshUnreadCount } = useNotifications()

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/notifications')
      
      if (!response.ok) {
        throw new Error('Error al cargar notificaciones')
      }
      
      const data = await response.json()
      setNotifications(data.notifications || [])
      
      // Actualizar el contador después de cargar las notificaciones
      await refreshUnreadCount()
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setError('No se pudieron cargar las notificaciones')
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string): Promise<boolean> => {
    try {
      // Verificar si ya está leída
      const notification = notifications.find(n => n.id === notificationId)
      if (!notification || notification.isRead) {
        return true // Ya está leída, no hacer nada
      }

      // Marcar como procesando
      setProcessingIds(prev => new Set(prev).add(notificationId))
      
      const response = await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: 'PATCH'
      })
      
      if (!response.ok) {
        throw new Error('Error al marcar como leída')
      }
      
      // Actualizar estado local inmediatamente para feedback visual
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      )
      
      // Refrescar el contador desde el servidor
      await refreshUnreadCount()
      
      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      setError('Error al marcar la notificación como leída')
      return false
    } finally {
      // Quitar de procesando
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(notificationId)
        return newSet
      })
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como leída primero
    const success = await markAsRead(notification.id)
    
    // Redirigir si tiene actionUrl
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      onClose()
    }
  }

  const markAllAsRead = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications', {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Error al marcar todas como leídas')
      }
      
      // Actualizar todas las notificaciones localmente
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      )
      
      // Refrescar contador
      await refreshUnreadCount()
    } catch (error) {
      console.error('Error marking all as read:', error)
      setError('Error al marcar todas como leídas')
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_REQUEST':
        return <Calendar className="w-5 h-5 text-blue-500" />
      case 'BOOKING_CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'BOOKING_CANCELLED':
      case 'BOOKING_REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'BOOKING_COMPLETED':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
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

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="absolute right-4 top-16 w-96 bg-white rounded-lg shadow-xl max-h-[32rem] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {unreadCount} sin leer
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                >
                  Marcar todas como leídas
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Notifications list */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No hay notificaciones</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const isProcessing = processingIds.has(notification.id)
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 transition-all ${
                    !notification.isRead ? 'bg-blue-50' : 'bg-white'
                  } ${
                    isProcessing ? 'opacity-60' : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                  onClick={() => !isProcessing && handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      ) : (
                        getNotificationIcon(notification.type)
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                    </div>

                    {notification.actionUrl && !isProcessing && (
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                router.push('/dashboard')
                onClose()
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Ir al panel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
