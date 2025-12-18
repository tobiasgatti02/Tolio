import { MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MessageBadgeProps {
  onClick?: () => void
}

export default function MessageBadge({ onClick }: MessageBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let mounted = true
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/messages/conversations')
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        const totalUnread = (data || []).reduce((sum: number, conv: any) => sum + (conv.unreadCount || 0), 0)
        setUnreadCount(totalUnread)
      } catch (err) {
        // ignore
      }
    }
    fetchConversations()

    // Poll every 60s
    const int = setInterval(fetchConversations, 60000)
    return () => {
      mounted = false
      clearInterval(int)
    }
  }, [])

  return (
    <button onClick={onClick} className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
      <MessageCircle className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
