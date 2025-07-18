"use client"

import { useState } from "react"
import { Star, X, ThumbsUp, ThumbsDown, Clock, Shield, MessageCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface MutualReviewModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  isOwner: boolean
  otherUser: {
    id: string
    name: string
    image?: string
  }
  item: {
    title: string
    image: string
  }
  onSubmit: (review: ReviewData) => Promise<void>
}

interface ReviewData {
  rating: number
  comment: string
  trustFactors: string[]
  bookingId: string
  revieweeId: string
}

const TRUST_FACTORS_OWNER = [
  { id: "respectful", label: "Respetuoso con el objeto", icon: "👍" },
  { id: "punctual", label: "Puntual en entrega/devolución", icon: "⏰" },
  { id: "communication", label: "Buena comunicación", icon: "💬" },
  { id: "careful", label: "Cuidadoso con el objeto", icon: "🛡️" },
  { id: "clean", label: "Devolvió limpio", icon: "✨" },
  { id: "trustworthy", label: "Confiable", icon: "🤝" },
]

const TRUST_FACTORS_BORROWER = [
  { id: "responsive", label: "Respuesta rápida", icon: "⚡" },
  { id: "helpful", label: "Ayuda y orientación", icon: "🤝" },
  { id: "flexible", label: "Flexible con horarios", icon: "⏰" },
  { id: "fair_pricing", label: "Precio justo", icon: "💰" },
  { id: "quality_item", label: "Objeto en buen estado", icon: "✅" },
  { id: "clear_instructions", label: "Instrucciones claras", icon: "📋" },
]

export default function MutualReviewModal({
  isOpen,
  onClose,
  bookingId,
  isOwner,
  otherUser,
  item,
  onSubmit
}: MutualReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [selectedTrustFactors, setSelectedTrustFactors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const trustFactors = isOwner ? TRUST_FACTORS_OWNER : TRUST_FACTORS_BORROWER

  const handleTrustFactorToggle = (factorId: string) => {
    setSelectedTrustFactors(prev => 
      prev.includes(factorId) 
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    )
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Por favor selecciona una calificación")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        rating,
        comment,
        trustFactors: selectedTrustFactors,
        bookingId,
        revieweeId: otherUser.id
      })
      onClose()
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Error al enviar la reseña")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Muy malo"
      case 2: return "Malo"
      case 3: return "Regular"
      case 4: return "Bueno"
      case 5: return "Excelente"
      default: return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            ¡Alquiler completado! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                <img 
                  src={item.image || "/placeholder.svg"} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600">
                  {isOwner ? `Alquilado a ${otherUser.name}` : `Alquilado de ${otherUser.name}`}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3">
              ¿Cómo fue tu experiencia con {otherUser.name}?
            </h3>
            
            <div className="flex justify-center items-center space-x-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <p className="text-sm text-gray-500">
              {getRatingText(hoveredRating || rating)}
            </p>
          </div>

          {/* Trust Factors */}
          <div>
            <h4 className="font-medium mb-3 text-gray-900">
              {isOwner 
                ? "¿Qué destacarías del inquilino?" 
                : "¿Qué destacarías del propietario?"
              } (opcional)
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {trustFactors.map((factor) => (
                <button
                  key={factor.id}
                  type="button"
                  onClick={() => handleTrustFactorToggle(factor.id)}
                  className={`
                    p-3 rounded-lg border-2 text-left transition-all duration-200
                    ${selectedTrustFactors.includes(factor.id)
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{factor.icon}</span>
                    <span className="text-sm font-medium">{factor.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Comment Section */}
          <div>
            <h4 className="font-medium mb-3 text-gray-900">
              Cuéntanos más sobre tu experiencia (opcional)
            </h4>
            
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                isOwner 
                  ? "Ej: Muy responsable, devolvió el objeto en perfecto estado y a tiempo."
                  : "Ej: Excelente atención, el objeto estaba en perfectas condiciones."
              }
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">
                  Tu reseña ayuda a construir confianza en la comunidad
                </p>
                <p>
                  Las reseñas honestas ayudan a otros usuarios a tomar mejores decisiones 
                  y mantienen la calidad de nuestra plataforma.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Saltar por ahora
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? "Enviando..." : "Enviar reseña"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
