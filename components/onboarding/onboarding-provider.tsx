"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import GuidedTour from "./guided-tour"

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
    const showOnboardingParam = searchParams?.get("onboarding") === "true"
    
    // ONLY show automatically if:
    // 1. URL has onboarding=true (just registered)
    // 2. User hasn't completed it before
    // 3. User is logged in
    if (showOnboardingParam && completed !== "true" && session?.user) {
      // Small delay for smooth transition after page load
      const timer = setTimeout(() => {
        setIsOpen(true)
        // Remove the URL parameter after triggering to prevent re-triggering on refresh
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href)
          url.searchParams.delete('onboarding')
          window.history.replaceState({}, '', url.toString())
        }
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
    // Mark as completed when closed/skipped to prevent automatic re-showing
    // User can still manually trigger it via "Ver tutorial" button
    handleComplete()
  }

  return (
    <OnboardingContext.Provider value={{ showOnboarding: showOnboardingManual, isOnboardingComplete: isComplete }}>
      {children}
      <GuidedTour 
        isOpen={isOpen} 
        onClose={handleClose} 
        onComplete={handleComplete} 
      />
    </OnboardingContext.Provider>
  )
}
