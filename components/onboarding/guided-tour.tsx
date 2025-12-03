"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useLocale } from "next-intl"
import SpotlightOverlay from "./spotlight-overlay"

interface TourStep {
  id: string
  title: string
  description: string
  targetSelector: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  path?: string // Optional: navigate to this path before showing step
  action?: () => void // Optional: action to perform before showing step
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a Tolio! 🎉',
    description: 'Te voy a mostrar cómo funciona la plataforma paso a paso. Puedes omitir este tour en cualquier momento.',
    targetSelector: 'body',
    position: 'bottom'
  },
  {
    id: 'stats',
    title: 'Tus Estadísticas',
    description: 'Aquí ves un resumen de tus publicaciones, reservas activas, ganancias totales y tu puntuación.',
    targetSelector: '[class*="grid"][class*="gap"]',
    position: 'bottom'
  },
  {
    id: 'bookings-menu',
    title: 'Gestiona tus Reservas',
    description: 'En esta sección puedes ver todas tus reservas: pendientes, activas y completadas.',
    targetSelector: '#sidebar-link-bookings',
    position: 'right'
  },
  {
    id: 'calendar-menu',
    title: 'Tu Calendario',
    description: 'Visualiza todas tus reservas en un calendario para organizar mejor tu tiempo y disponibilidad.',
    targetSelector: '#sidebar-link-calendar',
    position: 'right'
  },
  {
    id: 'items-menu',
    title: 'Tus Publicaciones',
    description: 'Aquí administras todas tus herramientas y servicios publicados. Puedes editarlos, pausarlos o eliminarlos.',
    targetSelector: '#sidebar-link-items',
    position: 'right'
  },
  {
    id: 'reviews-menu',
    title: 'Reseñas y Calificaciones',
    description: 'Lee las opiniones que otros usuarios han dejado sobre ti y tus servicios.',
    targetSelector: '#sidebar-link-reviews',
    position: 'right'
  },
  {
    id: 'quick-actions',
    title: 'Publicar Nuevo Artículo',
    description: '¿Tienes una herramienta para alquilar o un servicio para ofrecer? Usa este botón para publicarlo.',
    targetSelector: 'a[href*="/items/nuevo"]',
    position: 'left'
  },
  {
    id: 'profile-menu',
    title: 'Tu Perfil y Configuración',
    description: 'Configura tu cuenta, sube tu foto de perfil y gestiona tus preferencias desde aquí.',
    targetSelector: '#sidebar-link-settings',
    position: 'right'
  },
  {
    id: 'tutorial-button',
    title: '¿Necesitas ayuda?',
    description: '¡Perfecto! Si alguna vez necesitas volver a ver este tutorial, solo haz clic en "Ver tutorial" en el menú lateral.',
    targetSelector: 'button:has([class*="HelpCircle"])',
    position: 'right'
  },
  {
    id: 'complete',
    title: '¡Listo para empezar! 🚀',
    description: 'Ya conoces lo básico. Ahora puedes explorar, publicar tus primeros artículos o buscar lo que necesites. ¡Éxito!',
    targetSelector: 'body',
    position: 'bottom'
  }
]

interface GuidedTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function GuidedTour({ isOpen, onClose, onComplete }: GuidedTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right' | 'hidden'>('top')
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const locale = useLocale()
  const pathname = usePathname()

  const currentStep = tourSteps[currentStepIndex]

  useEffect(() => {
    if (!isOpen || !currentStep) return

    const updatePosition = () => {
      const isMobile = window.innerWidth < 1024
      const element = document.querySelector(currentStep.targetSelector) as HTMLElement
      
      // Logic for mobile when element is hidden (e.g. sidebar items)
      // Check if element exists but is likely hidden (width/height ~0 or off-screen)
      const isHidden = element && (element.offsetParent === null || element.getBoundingClientRect().width === 0)
      
      if (!element || (isMobile && isHidden)) {
        setTooltipPosition({ 
          top: window.innerHeight / 2 - 100, // Approximate center
          left: window.innerWidth / 2 - Math.min(350, window.innerWidth - 32) / 2 // Center horizontally
        })
        setArrowPosition('hidden')
        // Don't highlight anything if hidden
        setTargetElement(null)
        return
      }

      setTargetElement(element)
      const rect = element.getBoundingClientRect()
      const tooltipRect = tooltipRef.current?.getBoundingClientRect()
      
      if (!tooltipRect) return

      let top = 0
      let left = 0
      let arrow: 'top' | 'bottom' | 'left' | 'right' | 'hidden' = 'top'

      const spacing = 20
      
      // Force top/bottom on mobile to avoid horizontal overflow
      const preferredPosition = isMobile 
        ? (rect.top > window.innerHeight / 2 ? 'top' : 'bottom')
        : (currentStep.position || 'bottom')

      switch (preferredPosition) {
        case 'bottom':
          top = rect.bottom + spacing
          left = rect.left + (rect.width / 2) - (tooltipRect.width / 2)
          arrow = 'top'
          break
        case 'top':
          top = rect.top - tooltipRect.height - spacing
          left = rect.left + (rect.width / 2) - (tooltipRect.width / 2)
          arrow = 'bottom'
          break
        case 'left':
          top = rect.top + (rect.height / 2) - (tooltipRect.height / 2)
          left = rect.left - tooltipRect.width - spacing
          arrow = 'right'
          break
        case 'right':
          top = rect.top + (rect.height / 2) - (tooltipRect.height / 2)
          left = rect.right + spacing
          arrow = 'left'
          break
      }

      // Keep tooltip within viewport with padding
      const padding = 16
      
      // Horizontal containment
      if (left < padding) left = padding
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding
      }
      
      // Vertical containment
      if (top < padding) top = padding
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = window.innerHeight - tooltipRect.height - padding
      }

      setTooltipPosition({ top, left })
      setArrowPosition(arrow)

      // Scroll element into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    // Wait for DOM to be ready
    const timer = setTimeout(updatePosition, 100)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [currentStep, isOpen])

  const nextStep = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem("onboarding_completed", "true")
    onComplete()
    onClose()
  }

  const handleSkip = () => {
    localStorage.setItem("onboarding_completed", "true")
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {/* Spotlight overlay - only show if we have a valid target */}
      {targetElement && (
        <SpotlightOverlay 
          key="spotlight-overlay"
          targetSelector={currentStep.targetSelector}
          isActive={true}
          padding={12}
          borderRadius={12}
        />
      )}

      {/* Tooltip */}
      <motion.div
        key="tour-tooltip"
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[110] bg-white rounded-2xl shadow-2xl border-2 border-orange-500 max-w-[90vw] sm:max-w-sm"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        {/* Arrow - hide if no target or hidden */}
        {arrowPosition !== 'hidden' && (
          <div
            className={`absolute w-0 h-0 border-8 ${
              arrowPosition === 'top' ? 'border-b-orange-500 border-x-transparent border-t-transparent -top-4 left-1/2 -translate-x-1/2' :
              arrowPosition === 'bottom' ? 'border-t-orange-500 border-x-transparent border-b-transparent -bottom-4 left-1/2 -translate-x-1/2' :
              arrowPosition === 'left' ? 'border-r-orange-500 border-y-transparent border-l-transparent -left-4 top-1/2 -translate-y-1/2' :
              'border-l-orange-500 border-y-transparent border-r-transparent -right-4 top-1/2 -translate-y-1/2'
            }`}
          />
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{currentStep.title}</h3>
                <p className="text-xs text-gray-500">
                  Paso {currentStepIndex + 1} de {tourSteps.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <p className="text-gray-700 mb-6 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStepIndex + 1) / tourSteps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                currentStepIndex === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4 inline mr-1" />
              Anterior
            </button>

            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 px-2"
            >
              Omitir tour
            </button>

            <button
              onClick={nextStep}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              {currentStepIndex === tourSteps.length - 1 ? (
                <>¡Entendido!</>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
