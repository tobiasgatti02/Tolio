"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  LayoutDashboard,
  Package,
  Calendar,
  Star,
  Plus,
  Search,
  CheckCircle,
  Sparkles
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import SpotlightOverlay from "./spotlight-overlay"

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  image?: string
  highlight?: string
  spotlightSelector?: string
  tips: string[]
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: "¡Bienvenido a Tolio!",
    description: "Tu plataforma para alquilar herramientas y contratar servicios. Te guiaremos por las funciones principales.",
    icon: <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-orange-500" />,
    tips: [
      "Conecta con tu comunidad local",
      "Ahorra dinero alquilando en vez de comprar",
      "Ofrece tus servicios o herramientas"
    ]
  },
  {
    id: 2,
    title: "Tu Panel de Control",
    description: "Desde el Dashboard accedes a todo: tus publicaciones, reservas, calendario, reseñas y más.",
    icon: <LayoutDashboard className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500" />,
    highlight: "/dashboard",
    tips: [
      "Accede desde el menú superior o tu perfil",
      "Ve estadísticas de tus publicaciones",
      "Gestiona todo desde un solo lugar"
    ]
  },
  {
    id: 3,
    title: "Tus Publicaciones",
    description: "En 'Mis Publicaciones' ves todas tus herramientas y servicios. Puedes editarlas, pausarlas o eliminarlas.",
    icon: <Package className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500" />,
    highlight: "/dashboard/my-items",
    tips: [
      "Agrega fotos de calidad para más reservas",
      "Mantén precios competitivos",
      "Responde rápido a las consultas"
    ]
  },
  {
    id: 4,
    title: "Ciclo de Reservas",
    description: "Las reservas pasan por diferentes estados: Pendiente → Confirmada → En Progreso → Completada",
    icon: <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-purple-500" />,
    highlight: "/dashboard/bookings",
    tips: [
      "Confirma o rechaza solicitudes rápidamente",
      "Coordina la entrega con el cliente",
      "Marca como completada al finalizar"
    ]
  },
  {
    id: 5,
    title: "Reviews y Reputación",
    description: "Las reseñas son fundamentales. Después de cada transacción, ambas partes pueden calificarse mutuamente.",
    icon: <Star className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500" />,
    highlight: "/dashboard/reviews",
    tips: [
      "Buenas reseñas = más reservas",
      "Responde siempre a los comentarios",
      "Sé profesional y puntual"
    ]
  },
  {
    id: 6,
    title: "Cómo Publicar",
    description: "Publicar es fácil: toca el botón '+' o 'Publicar', elige si es herramienta o servicio, completa los datos y listo.",
    icon: <Plus className="w-12 h-12 sm:w-16 sm:h-16 text-orange-500" />,
    tips: [
      "Usa títulos claros y descriptivos",
      "Sube múltiples fotos desde diferentes ángulos",
      "Define bien tu zona de servicio"
    ]
  },
  {
    id: 7,
    title: "Buscar y Reservar",
    description: "Explora herramientas o servicios, filtra por ubicación, precio o categoría, y solicita una reserva.",
    icon: <Search className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500" />,
    tips: [
      "Usa filtros para encontrar lo exacto",
      "Revisa las reseñas antes de reservar",
      "Contacta al dueño si tienes dudas"
    ]
  },
  {
    id: 8,
    title: "¡Estás listo!",
    description: "Ya conoces lo básico de Tolio. Ahora explora, publica tus primeros artículos o encuentra lo que necesitas.",
    icon: <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" />,
    tips: [
      "Empieza publicando algo simple",
      "Completa tu perfil para más confianza",
      "¡La comunidad te espera!"
    ]
  }
]

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [showSpotlight, setShowSpotlight] = useState(false)
  const router = useRouter()
  const locale = useLocale()

  // Activate spotlight after modal animation
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowSpotlight(true), 400)
      return () => clearTimeout(timer)
    } else {
      setShowSpotlight(false)
    }
  }, [isOpen, currentStep])

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1)
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    // Guardar que el usuario completó el onboarding
    localStorage.setItem("onboarding_completed", "true")
    onComplete()
    onClose()
  }

  const handleSkip = () => {
    localStorage.setItem("onboarding_completed", "true")
    onClose()
  }

  const goToHighlight = (path: string) => {
    handleComplete()
    router.push(`/${locale}${path}`)
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  if (!isOpen) return null

  const step = steps[currentStep]

  return (
    <AnimatePresence>
      {/* Spotlight overlay */}
      <SpotlightOverlay 
        targetSelector={step.spotlightSelector}
        isActive={showSpotlight && !!step.spotlightSelector}
        padding={12}
        borderRadius={16}
      />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
        style={{ 
          backgroundColor: step.spotlightSelector ? 'transparent' : 'rgba(0, 0, 0, 0.7)',
          backdropFilter: step.spotlightSelector ? 'none' : 'blur(8px)'
        }}
        onClick={(e: React.MouseEvent) => e.target === e.currentTarget && handleSkip()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header con progreso */}
          <div className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
            <button
              onClick={handleSkip}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Progress bar */}
            <div className="flex gap-1 sm:gap-1.5 mb-4 sm:mb-6 pr-8">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 sm:h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    index <= currentStep ? "bg-orange-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            
            <p className="text-xs sm:text-sm text-gray-500 mb-2">
              Paso {currentStep + 1} de {steps.length}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden px-4 sm:px-6">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col items-center text-center"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl sm:rounded-3xl"
                >
                  {step.icon}
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2"
                >
                  {step.title}
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed px-2"
                >
                  {step.description}
                </motion.p>

                {/* Tips */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="w-full space-y-2 sm:space-y-3 mb-4 sm:mb-6"
                >
                  {step.tips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl text-left"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700">{tip}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Go to section button */}
                {step.highlight && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => goToHighlight(step.highlight!)}
                    className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium underline underline-offset-2 mb-2"
                  >
                    Ir a esta sección →
                  </motion.button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer with navigation */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 bg-gray-50 border-t flex items-center justify-between gap-3">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all ${
                currentStep === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <button
              onClick={handleSkip}
              className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 px-2"
            >
              Omitir
            </button>

            <button
              onClick={nextStep}
              className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base shadow-lg hover:shadow-xl transition-all"
            >
              <span>{currentStep === steps.length - 1 ? "¡Empezar!" : "Siguiente"}</span>
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
