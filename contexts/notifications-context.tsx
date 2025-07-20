"use client"

import { createContext, useContext, useState, useEffect } from 'react'

interface NotificationsContextType {
  unreadCount: number
  setUnreadCount: (count: number) => void
  decrementUnreadCount: () => void
  refreshUnreadCount: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnreadCount = async () => {
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

  const decrementUnreadCount = () => {
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  useEffect(() => {
    refreshUnreadCount()

    // Polling cada 30 segundos para mantener sincronizado (más frecuente)
    const interval = setInterval(refreshUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <NotificationsContext.Provider value={{
      unreadCount,
      setUnreadCount,
      decrementUnreadCount,
      refreshUnreadCount
    }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
