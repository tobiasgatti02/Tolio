"use client"

import { useState } from "react"
import { Flag, X, Send, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface ReportButtonProps {
  itemId?: string
  serviceId?: string
  itemTitle: string
  itemType: 'item' | 'service'
  reportedUserId: string
  reportedUserName: string
}

export default function ReportButton({
  itemId,
  serviceId,
  itemTitle,
  itemType,
  reportedUserId,
  reportedUserName
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const reasons = [
    "Contenido inapropiado o engañoso",
    "Precio sospechoso o estafa",
    "Artículo/Servicio falsificado",
    "Conducta inapropiada del usuario",
    "Incumplimiento de términos y condiciones",
    "Otro"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason || !details.trim()) {
      alert("Por favor completa todos los campos")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          serviceId,
          itemTitle,
          itemType,
          reportedUserId,
          reportedUserName,
          reason,
          details
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          setIsOpen(false)
          setSubmitted(false)
          setReason("")
          setDetails("")
        }, 3000)
      } else {
        throw new Error("Error al enviar la denuncia")
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      alert("Error al enviar la denuncia. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
      >
        <Flag className="h-4 w-4 mr-2" />
        Denunciar
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Denunciar {itemType === 'item' ? 'Artículo' : 'Servicio'}
            </DialogTitle>
            <DialogDescription>
              Tu denuncia será enviada para revisión. Toda la información es confidencial.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Denuncia Enviada
              </h3>
              <p className="text-sm text-gray-600">
                Gracias por ayudarnos a mantener la comunidad segura.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Item Info */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">
                    {itemType === 'item' ? 'Artículo' : 'Servicio'}:
                  </span>{" "}
                  {itemTitle}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Publicado por:</span> {reportedUserName}
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de la denuncia *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecciona un motivo</option>
                  {reasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detalles *
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Describe el problema con el mayor detalle posible..."
                  required
                />
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  Tu identidad se mantendrá confidencial. Revisaremos tu denuncia y tomaremos las medidas apropiadas.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !reason || !details.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Denuncia
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
