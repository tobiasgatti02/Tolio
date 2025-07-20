import { Bell } from 'lucide-react'
import { useNotifications } from '@/contexts/notifications-context'

interface NotificationBadgeProps {
  userId: string
  onClick?: () => void
}

export default function NotificationBadge({ userId, onClick }: NotificationBadgeProps) {
  const { unreadCount } = useNotifications()

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
