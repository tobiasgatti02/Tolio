"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
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
  triggerOnMount?: boolean
}

export function OnboardingProvider({ children, triggerOnMount = false }: OnboardingProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isComplete, setIsComplete] = useState(true) // Default true to avoid flash

  useEffect(() => {
    // Check localStorage on mount
    const completed = localStorage.getItem("onboarding_completed")
    setIsComplete(completed === "true")
    
    // If triggerOnMount and not completed, show onboarding
    if (triggerOnMount && completed !== "true") {
      // Small delay for smooth transition after page load
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [triggerOnMount])

  const showOnboarding = () => {
    setIsOpen(true)
  }

  const handleComplete = () => {
    setIsComplete(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <OnboardingContext.Provider value={{ showOnboarding, isOnboardingComplete: isComplete }}>
      {children}
      <OnboardingModal 
        isOpen={isOpen} 
        onClose={handleClose} 
        onComplete={handleComplete} 
      />
    </OnboardingContext.Provider>
  )
}
