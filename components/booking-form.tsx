"use client"

import { useState, useEffect } from "react"
import { Calendar, Loader2, CreditCard, X, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { createBooking } from "@/app/api/booking/route"
import PaymentButton from "@/components/payment-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [createdBooking, setCreatedBooking] = useState<{ id: string; totalPrice: number } | null>(null)
  
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
        // Calcular el precio total
        const totalPrice = price * totalDays + Math.round(price * totalDays * 0.1)
        
        // Guardar información de la reserva
        setCreatedBooking({
          id: result.bookingId,
          totalPrice: totalPrice
        })
        
        // Mostrar modal de pago
        setShowPaymentModal(true)
        
        toast({
          title: "Reserva creada",
          description: "Ahora puedes proceder con el pago para confirmar tu reserva.",
          variant: "default",
        })
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
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-emerald-700 mb-2">
            Fecha de inicio
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className="pl-10 block w-full rounded-lg border-emerald-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors py-3 text-sm bg-emerald-50/50 hover:bg-emerald-50"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-emerald-700 mb-2">
            Fecha de fin
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className="pl-10 block w-full rounded-lg border-emerald-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors py-3 text-sm bg-emerald-50/50 hover:bg-emerald-50"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-gray-700">
            {price}$ × {totalDays} días
          </span>
          <span className="font-medium">{price * totalDays}$</span>
        </div>
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-gray-700">Comisión de servicio</span>
          <span className="font-medium">{Math.round(price * totalDays * 0.1)}$</span>
        </div>
        <div className="border-t border-emerald-200 pt-2 mt-2 font-bold text-emerald-800 flex justify-between">
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

      {/* Modal de Pago */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-emerald-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              ¡Reserva Creada!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Tu reserva ha sido creada exitosamente. Ahora procede con el pago para confirmarla.
              </p>
            </div>

            {/* Resumen del pago */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Resumen del pago</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Fechas:</span>
                  <span>{startDate} - {endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duración:</span>
                  <span>{totalDays} día{totalDays !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${price * totalDays}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comisión de servicio:</span>
                  <span>${Math.round(price * totalDays * 0.1)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-emerald-600">
                  <span>Total:</span>
                  <span>${price * totalDays + Math.round(price * totalDays * 0.1)}</span>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="space-y-3">
              {createdBooking && (
                <PaymentButton
                  bookingId={createdBooking.id}
                  amount={createdBooking.totalPrice}
                  onPaymentStart={() => setShowPaymentModal(false)}
                />
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    if (createdBooking) {
                      router.push(`/dashboard/bookings/${createdBooking.id}`)
                    }
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Pagar después
                </button>
                
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center">
              💡 Puedes completar el pago más tarde desde tu panel de reservas
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  )
}