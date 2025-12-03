"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import OnboardingModal from "./onboarding-modal"

interface OnboardingContextType {
  showOnboarding: () => void
  isOnboardingComplete: boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider")
  }
  return context
}

interface OnboardingProviderProps {
  children: ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isComplete, setIsComplete] = useState(true) // Default true to avoid flash
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Only run when session is loaded
    if (status === "loading") return

    // Check localStorage on mount
    const completed = localStorage.getItem("onboarding_completed")
    setIsComplete(completed === "true")
    
    // Check if user just registered (via URL param)
    const showOnboarding = searchParams?.get("onboarding") === "true"
    
    // If user just registered and hasn't completed onboarding, show it
    if (showOnboarding && completed !== "true" && session?.user) {
      // Small delay for smooth transition after page load
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [session, status, searchParams])

  const showOnboardingManual = () => {
    setIsOpen(true)
  }

  const handleComplete = () => {
    setIsComplete(true)
    localStorage.setItem("onboarding_completed", "true")
  }

  const handleClose = () => {
    setIsOpen(false)
    // Mark as completed even if skipped to prevent showing again
    if (!isComplete) {
      handleComplete()
    }
  }

  return (
    <OnboardingContext.Provider value={{ showOnboarding: showOnboardingManual, isOnboardingComplete: isComplete }}>
      {children}
      <OnboardingModal 
        isOpen={isOpen} 
        onClose={handleClose} 
        onComplete={handleComplete} 
      />
    </OnboardingContext.Provider>
  )
}
