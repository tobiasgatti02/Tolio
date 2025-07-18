"use client"

import { useState, useEffect } from "react"
import { Calendar, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { createBooking } from "@/app/api/booking/route"
import { Yesteryear } from "next/font/google"

interface BookingFormProps {
  itemId: string
  price: number
}

export default function BookingForm({ itemId, price }: BookingFormProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [totalDays, setTotalDays] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  
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
      let yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)
      today.setHours(0, 0, 0, 0)

      setError("")
      
      if (start < yesterday) {
        setError("La fecha de inicio no puede ser en el pasado")
      } else if (start >= end) {
        setError("La fecha de finalización debe ser posterior a la fecha de inicio")
      }
    }
  }, [startDate, endDate])

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError("")
    
    formData.append("itemId", itemId)
    
    try {
      const result = await createBooking(formData)
      
      if (result.success && result.bookingId) {
        toast({
          title: "Reserva creada",
          description: "Tu reserva ha sido enviada al propietario para su confirmación.",
          variant: "default",
        })
        
        // Redirect to the bookings page
        router.push(`/bookings/${result.bookingId}`)
      } else {
        setError(result.error || "Hubo un error al crear la reserva")
        toast({
          title: "Error",
          description: result.error || "Hubo un error al crear la reserva",
          variant: "destructive",
        })
      }
    } catch (error) {
      setError("Error inesperado. Por favor inténtalo de nuevo.")
      toast({
        title: "Error",
        description: "Error inesperado. Por favor inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Comienzo de alquiler
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fin del alquiler
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span>
            {price}$ × {totalDays} días
          </span>
          <span>{price * totalDays}$</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Comisión de servicio</span>
          <span>{Math.round(price * totalDays * 0.1)}$</span>
        </div>
        <div className="border-t pt-2 mt-2 font-bold flex justify-between">
          <span>Total</span>
          <span>{price * totalDays + Math.round(price * totalDays * 0.1)}$</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !!error}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-3 rounded-lg font-medium flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          'Alquilar'
        )}
      </button>
    </form>
  )
}