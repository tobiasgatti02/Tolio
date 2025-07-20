"use client"

import { useState } from "react"
import { MessageSquare, Send, X, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ReviewResponseProps {
  reviewId: string
  existingResponse?: string | null
}

export default function ReviewResponse({ reviewId, existingResponse }: ReviewResponseProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [response, setResponse] = useState(existingResponse || "")
  const [currentResponse, setCurrentResponse] = useState(existingResponse || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!response.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: response.trim() }),
      })

      if (!res.ok) {
        throw new Error('Error al enviar la respuesta')
      }

      const data = await res.json()
      setCurrentResponse(response.trim())
      setIsOpen(false)
      
      toast({
        title: "Respuesta enviada",
        description: "Tu respuesta ha sido publicada exitosamente.",
        variant: "default",
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (currentResponse && !isOpen) {
    return (
      <div className="mt-3 pl-4 border-l-2 border-emerald-200 bg-emerald-50 p-3 rounded-r-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center text-sm text-emerald-700 font-medium mb-1">
              <MessageSquare className="h-4 w-4 mr-1" />
              Respuesta del propietario
            </div>
            <p className="text-sm text-emerald-800">{currentResponse}</p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="text-emerald-600 hover:text-emerald-700 text-xs ml-2"
          >
            Editar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          {currentResponse ? 'Editar respuesta' : 'Responder'}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="border-l-2 border-emerald-200 pl-4">
            <label htmlFor={`response-${reviewId}`} className="block text-sm font-medium text-gray-700 mb-2">
              Tu respuesta
            </label>
            <textarea
              id={`response-${reviewId}`}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Escribe una respuesta profesional y cortés..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
            />
            <div className="text-xs text-gray-500 mt-1">
              {response.length}/500 caracteres
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !response.trim()}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Enviar respuesta
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setResponse(currentResponse || "")
              }}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-700 text-sm"
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
