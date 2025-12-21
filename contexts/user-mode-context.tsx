"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type UserMode = 'buyer' | 'seller'

interface UserModeContextType {
  userMode: UserMode
  setUserMode: (mode: UserMode) => void
  toggleUserMode: () => void
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined)

export function UserModeProvider({ children }: { children: ReactNode }) {
  const [userMode, setUserMode] = useState<UserMode>('seller')

  useEffect(() => {
    const stored = localStorage.getItem('userMode') as UserMode
    if (stored && (stored === 'buyer' || stored === 'seller')) {
      setUserMode(stored)
    }
  }, [])

  const handleSetUserMode = (mode: UserMode) => {
    setUserMode(mode)
    localStorage.setItem('userMode', mode)
  }

  const toggleUserMode = () => {
    const newMode = userMode === 'buyer' ? 'seller' : 'buyer'
    handleSetUserMode(newMode)
  }

  return (
    <UserModeContext.Provider value={{ userMode, setUserMode: handleSetUserMode, toggleUserMode }}>
      {children}
    </UserModeContext.Provider>
  )
}

export function useUserMode() {
  const context = useContext(UserModeContext)
  if (context === undefined) {
    throw new Error('useUserMode must be used within a UserModeProvider')
  }
  return context
}