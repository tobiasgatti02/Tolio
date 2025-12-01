"use client"

import { useState, useEffect } from "react"
import { Calendar, Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface BookingFormProps {
  itemId?: string
  serviceId?: string
  itemTitle: string
  ownerName: string
  ownerAddress: string
  price: number | null
  type: 'item' | 'service'
}

export default function BookingFormFree({ 
  itemId,
  serviceId,
  itemTitle, 
  ownerName, 
  ownerAddress, 
  price,
  type
}: BookingFormProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [hours, setHours] = useState("1")
  const [totalDays, setTotalDays] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()

  // Calculate total days when dates change (for items)
  useEffect(() => {
    if (type === 'item' && startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setTotalDays(diffDays || 1)
    }
  }, [startDate, endDate, type])

  // Validate dates when they change
  useEffect(() => {
    if (startDate && (type === 'item' ? endDate : true)) {
      const start = new Date(startDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      setError("")
      
      if (start < today) {
        setError("La fecha no puede ser en el pasado")
      }
      
      if (type === 'item' && endDate) {
        const end = new Date(endDate)
        if (start >= end) {
          setError("La fecha de fin debe ser posterior a la fecha de inicio")
        }
      }
    }
  }, [startDate, endDate, type])

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (type === 'item') {
      if (!startDate || !endDate) {
        setError("Por favor completa todas las fechas")
        return
      }
    } else {
      if (!startDate) {
        setError("Por favor selecciona la fecha del servicio")
        return
      }
    }

    if (error) {
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const endpoint = type === 'item' ? "/api/booking" : "/api/service-booking"
      const body = type === 'item' 
        ? {
            itemId,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate!).toISOString(),
            totalDays,
            skipPayment: true
          }
        : {
            serviceId,
            startDate: new Date(startDate).toISOString(),
            skipPayment: true
          }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la reserva")
      }

      setSuccess(true)
      toast({
        title: "¡Reserva creada!",
        description: "Tu reserva fue creada exitosamente. El propietario te contactará pronto.",
      })

      // Redirect after success
      setTimeout(() => {
        router.push('/dashboard/bookings')
        router.refresh()
      }, 1500)

    } catch (error: any) {
      console.error("Error creating booking:", error)
      setError(error.message || "Hubo un error al crear la reserva")
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la reserva",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculatedQuantity = type === 'item' ? totalDays : parseInt(hours)
  const totalPrice = price ? price * calculatedQuantity : 0
  // const serviceFee = Math.round(totalPrice * 0.1)
  const grandTotal = totalPrice 

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
        <div className={type === 'item' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : ""}>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'service' ? 'Fecha del Servicio *' : 'Fecha de Inicio *'}
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

          {type === 'item' && (
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
          )}
        </div>

        {/* Price Summary */}
        {startDate && (type === 'item' ? endDate : true) && !error && price && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {type === 'service' ? 'Precio del servicio' : `$${price.toLocaleString()} x ${calculatedQuantity} ${calculatedQuantity === 1 ? 'día' : 'días'}`}
              </span>
              <span className="font-medium text-gray-900">${type === 'service' ? price.toLocaleString() : totalPrice.toLocaleString()}</span>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total Estimado</span>
                <span className="font-bold text-xl text-blue-600">${type === 'service' ? price.toLocaleString() : grandTotal.toLocaleString()}</span>
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
          disabled={isSubmitting || !!error || !startDate || (type === 'item' && !endDate)}
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
