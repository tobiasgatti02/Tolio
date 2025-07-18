"use client"

import { useState } from "react"
import { Star, X, Send } from "lucide-react"

interface BookingItem {
  id: string
  status: string
  item: {
    id: string
    title: string
    images: string[]
    price: number
  }
  borrower: {
    id: string
    firstName: string
    profileImage?: string | null
  }
  owner: {
    id: string
    firstName: string
    profileImage?: string | null
  }
  startDate: Date
  endDate: Date
  totalAmount: number
  paymentStatus: string
  createdAt: Date
  canReview: boolean
  hasReviewed: boolean
}

interface ReviewModalProps {
  booking: BookingItem
  userId: string
  onClose: () => void
}

export default function ReviewModal({ booking, userId, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const isOwner = booking.owner.id === userId
  const reviewee = isOwner ? booking.borrower : booking.owner
  const relationshipType = isOwner ? 'borrower' : 'owner'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert('Por favor selecciona una calificación')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          itemId: booking.item.id,
          revieweeId: reviewee.id,
          rating,
          comment,
          trustFactors: [] // Can be expanded later
        }),
      })

      if (response.ok) {
        // Create notification for the reviewee
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: reviewee.id,
            type: 'REVIEW_RECEIVED',
            content: `Has recibido una nueva reseña de ${rating} estrellas para el artículo "${booking.item.title}"`
          }),
        })

        onClose()
      } else {
        alert('Error al enviar la reseña')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Error al enviar la reseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Calificar {relationshipType === 'borrower' ? 'prestatario' : 'prestador'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Usuario info */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            {reviewee.profileImage ? (
              <img
                className="w-12 h-12 rounded-full"
                src={reviewee.profileImage}
                alt=""
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {reviewee.firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{reviewee.firstName}</p>
              <p className="text-sm text-gray-600">
                {relationshipType === 'borrower' ? 'Prestatario' : 'Prestador'} de "{booking.item.title}"
              </p>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Comparte tu experiencia ${relationshipType === 'borrower' ? 'con este prestatario' : 'con este prestador'}...`}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Reseña</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
