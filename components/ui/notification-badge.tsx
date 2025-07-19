import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'

interface NotificationBadgeProps {
  userId: string
  onClick?: () => void
}

export default function NotificationBadge({ userId, onClick }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`/api/notifications/unread-count`)
        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.count)
        }
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }

    fetchUnreadCount()

    // Polling cada 30 segundos para actualizar el contador
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [userId])

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
