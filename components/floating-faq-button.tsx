"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle, X, ChevronDown, CreditCard, Calendar, Shield, MessageCircle } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

interface FAQSection {
  title: string
  icon: React.ReactNode
  items: FAQItem[]
}

const faqData: FAQSection[] = [
  {
    title: "Pagos y Transacciones",
    icon: <CreditCard className="w-5 h-5" />,
    items: [
      {
        question: "¿Cómo funcionan los pagos?",
        answer: "Los pagos por el momento estan desactivados, pronto la aplicación procesará pagos internos entre partes."
      }
    ]
  },
  {
    title: "Reservas",
    icon: <Calendar className="w-5 h-5" />,
    items: [
      {
        question: "¿Cómo hago una reserva?",
        answer: "Busca el artículo o servicio que necesitas, selecciona las fechas y envía una solicitud. El propietario la confirmará o rechazará."
      },
      {
        question: "¿Puedo cancelar una reserva?",
        answer: "Sí, puedes cancelar antes de que comience. Las políticas de reembolso varían según el propietario."
      },
      {
        question: "¿Qué pasa si el artículo no está disponible?",
        answer: "El propietario puede rechazar tu solicitud si el artículo no está disponible. No se te cobrará nada."
      }
    ]
  },
  {
    title: "Seguridad",
    icon: <Shield className="w-5 h-5" />,
    items: [
      {
        question: "¿Cómo sé que puedo confiar en un usuario?",
        answer: "Revisa las reseñas, la puntuación y el badge de identidad verificada antes de hacer una reserva."
      },
      {
        question: "¿Qué hago si hay un problema?",
        answer: "Contacta primero al otro usuario. Si no se resuelve, nuestro equipo de soporte puede ayudarte."
      },
      {
        question: "¿Están asegurados los artículos?",
        answer: "Cada alquiler incluye protección básica. Revisa los términos específicos en cada publicación."
      }
    ]
  }
]

export default function FloatingFaqButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow"
            aria-label="Abrir centro de ayuda"
          >
            <HelpCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded FAQ Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* FAQ Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 100, y: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 100, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
              style={{ maxWidth: "calc(100vw - 3rem)" }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Centro de Ayuda</h3>
                    <p className="text-xs text-orange-100">Preguntas frecuentes</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {faqData.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(sectionIndex)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-orange-600">{section.icon}</div>
                        <span className="font-semibold text-gray-900">{section.title}</span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          expandedSections.has(sectionIndex) ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Section Items */}
                    <AnimatePresence>
                      {expandedSections.has(sectionIndex) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 space-y-3 bg-white">
                            {section.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="space-y-1">
                                <p className="font-medium text-sm text-gray-900">{item.question}</p>
                                <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {/* Contact Support */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center">
                  <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900 mb-1">¿No encontraste lo que buscabas?</p>
                  <p className="text-xs text-gray-600 mb-3">Nuestro equipo está listo para ayudarte</p>
                  <a
                    href="/contact"
                    className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Contactar Soporte
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
