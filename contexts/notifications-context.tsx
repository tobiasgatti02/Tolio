"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

interface NotificationsContextType {
  unreadCount: number
  setUnreadCount: (count: number) => void
  decrementUnreadCount: () => void
  refreshUnreadCount: () => Promise<void>
  forceRefresh: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isRefreshingRef = useRef(false)

  // Debounced refresh function
  const refreshUnreadCount = useCallback(async () => {
    // Clear any pending refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    // Debounce: wait 300ms before actually refreshing
    return new Promise<void>((resolve) => {
      refreshTimeoutRef.current = setTimeout(async () => {
        // Prevent multiple simultaneous refreshes
        if (isRefreshingRef.current) {
          resolve()
          return
        }

        try {
          isRefreshingRef.current = true
          const response = await fetch(`/api/notifications/unread-count`)
          
          if (response.ok) {
            const data = await response.json()
            setUnreadCount(data.count)
          }
        } catch (error) {
          console.error('Error fetching unread count:', error)
        } finally {
          isRefreshingRef.current = false
          resolve()
        }
      }, 300)
    })
  }, [])

  // Force immediate refresh without debouncing
  const forceRefresh = useCallback(async () => {
    // Clear any pending debounced refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    // Prevent multiple simultaneous refreshes
    if (isRefreshingRef.current) {
      return
    }

    try {
      isRefreshingRef.current = true
      const response = await fetch(`/api/notifications/unread-count`)
      
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    } finally {
      isRefreshingRef.current = false
    }
  }, [])

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  useEffect(() => {
    // Initial fetch
    forceRefresh()

    // Polling every 3 minutes
    const interval = setInterval(forceRefresh, 180000)

    return () => {
      clearInterval(interval)
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [forceRefresh])

  return (
    <NotificationsContext.Provider value={{
      unreadCount,
      setUnreadCount,
      decrementUnreadCount,
      refreshUnreadCount,
      forceRefresh
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
