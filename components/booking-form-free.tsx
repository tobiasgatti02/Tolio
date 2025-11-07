"use client"

import { useState, useEffect } from "react"
import { Calendar, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface BookingFormProps {
  itemId: string
  itemTitle: string
  ownerName: string
  ownerAddress: string
  price: number
  type?: 'item' | 'service'
}

export default function BookingFormFree({ 
  itemId, 
  itemTitle, 
  ownerName, 
  ownerAddress, 
  price,
  type = 'item'
}: BookingFormProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [totalDays, setTotalDays] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()

  // Calculate total days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setTotalDays(diffDays || 1)
    }
  }, [startDate, endDate])

  // Validate dates when they change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      setError("")
      
      if (start < today) {
        setError("La fecha de inicio no puede ser en el pasado")
      } else if (start >= end) {
        setError("La fecha de fin debe ser posterior a la fecha de inicio")
      }
    }
  }, [startDate, endDate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!startDate || !endDate) {
      setError("Por favor selecciona las fechas")
      return
    }

    if (error) {
      return
    }

    setIsSubmitting(true)
    setError("")
    
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          startDate,
          endDate,
          skipPayment: true // Flag para indicar que no se requiere pago
        }),
      })
      
      const result = await response.json()
      
      if (result.success && result.bookingId) {
        setSuccess(true)
        
        toast({
          title: "¡Reserva Creada!",
          description: "Tu solicitud de reserva ha sido enviada al propietario.",
          variant: "default",
        })

        // Redirigir después de 2 segundos
        setTimeout(() => {
          router.push(`/dashboard/bookings/${result.bookingId}`)
        }, 2000)
      } else {
        setError(result.error || "Hubo un error al crear la reserva")
        toast({
          title: "Error",
          description: result.error || "Hubo un error al crear la reserva",
          variant: "destructive",
        })
      }
    } catch (error) {
      setError("Error inesperado. Por favor, intenta de nuevo.")
      toast({
        title: "Error",
        description: "Error inesperado. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalPrice = price * totalDays
  const serviceFee = Math.round(totalPrice * 0.1)
  const grandTotal = totalPrice + serviceFee

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva Creada!</h3>
          <p className="text-gray-600 mb-4">
            Tu solicitud ha sido enviada a <span className="font-semibold">{ownerName}</span>
          </p>
          <p className="text-sm text-gray-500">
            Redirigiendo a tus reservas...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Solicitar Reserva</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        {/* Información del propietario */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Propietario:</span> {ownerName}
          </p>
          <p className="text-sm text-gray-700 mt-1">
            <span className="font-semibold">Ubicación:</span> {ownerAddress}
          </p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="pl-10 block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors py-3 text-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Fin *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="pl-10 block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors py-3 text-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
        </div>

        {/* Price Summary */}
        {startDate && endDate && !error && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                ${price.toLocaleString()} x {totalDays} {totalDays === 1 ? type === 'service' ? 'hora' : 'día' : type === 'service' ? 'horas' : 'días'}
              </span>
              <span className="font-medium text-gray-900">${totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tarifa de servicio (10%)</span>
              <span className="font-medium text-gray-900">${serviceFee.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total Estimado</span>
                <span className="font-bold text-xl text-blue-600">${grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Importante:</span> Esta es una solicitud de reserva gratuita. 
            El propietario debe confirmar tu solicitud antes de que la reserva sea efectiva. 
            Los detalles de pago se coordinarán directamente con el propietario.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !!error || !startDate || !endDate}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Enviando solicitud...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              Solicitar Reserva
            </>
          )}
        </button>
      </form>
    </div>
  )
}
