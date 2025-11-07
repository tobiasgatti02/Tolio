"use client"

import { useState, useEffect } from "react"
import { Calendar, Loader2, CreditCard, Shield, AlertCircle, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { TermsModal } from "@/components/terms-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BookingFormWithPaymentProps {
  itemId: string
  price: number
  ownerId: string
  ownerName: string
  ownerHasStripe: boolean
  ownerHasMercadoPago: boolean
}

export default function BookingFormWithPayment({ 
  itemId, 
  price,
  ownerId,
  ownerName,
  ownerHasStripe,
  ownerHasMercadoPago 
}: BookingFormWithPaymentProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [totalDays, setTotalDays] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mercadopago'>('stripe')
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [pendingBooking, setPendingBooking] = useState<{
    startDate: string
    endDate: string
    totalPrice: number
  } | null>(null)
  
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

  // Auto-select payment method based on owner's configuration
  useEffect(() => {
    if (!ownerHasStripe && ownerHasMercadoPago) {
      setPaymentMethod('mercadopago')
    } else if (ownerHasStripe && !ownerHasMercadoPago) {
      setPaymentMethod('stripe')
    }
  }, [ownerHasStripe, ownerHasMercadoPago])

  const totalPrice = price * totalDays + Math.round(price * totalDays * 0.1)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!startDate || !endDate) {
      setError("Por favor selecciona las fechas")
      return
    }

    if (error) return

    // Guardar datos temporales y mostrar modal de términos
    setPendingBooking({
      startDate,
      endDate,
      totalPrice
    })
    setShowTermsModal(true)
  }

  async function handleAcceptTerms() {
    if (!pendingBooking) return
    
    setShowTermsModal(false)
    setIsSubmitting(true)
    setError("")
    
    const formData = new FormData()
    formData.append("itemId", itemId)
    formData.append("startDate", pendingBooking.startDate)
    formData.append("endDate", pendingBooking.endDate)
    
    try {
      // Llamar a la API usando fetch en lugar de importar directamente
      const response = await fetch('/api/booking', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (result.success && result.bookingId) {
        toast({
          title: "Reserva creada",
          description: "Redirigiendo al pago...",
          variant: "default",
        })

        // Redirigir según el método de pago seleccionado
        if (paymentMethod === 'stripe') {
          // Crear PaymentIntent de Stripe
          const paymentResponse = await fetch('/api/stripe/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: result.bookingId,
              amount: pendingBooking.totalPrice,
            }),
          })

          if (paymentResponse.ok) {
            const { clientSecret } = await paymentResponse.json()
            router.push(`/payment?booking=${result.bookingId}&client_secret=${clientSecret}`)
          } else {
            throw new Error('Error al crear PaymentIntent')
          }
        } else {
          // Crear preferencia de MercadoPago
          const mpResponse = await fetch('/api/mercadopago/create-preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: result.bookingId,
            }),
          })

          if (mpResponse.ok) {
            const { initPoint, sandboxInitPoint } = await mpResponse.json()
            // Redirigir a MercadoPago
            const mpUrl = process.env.NODE_ENV === 'production' ? initPoint : (sandboxInitPoint || initPoint)
            window.location.href = mpUrl
          } else {
            throw new Error('Error al crear preferencia de MercadoPago')
          }
        }
      } else {
        setError(result.error || "Hubo un error al crear la reserva")
        toast({
          title: "Error",
          description: result.error || "Hubo un error al crear la reserva",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      setError("Error inesperado. Por favor inténtalo de nuevo.")
      toast({
        title: "Error",
        description: "Error inesperado. Por favor inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setPendingBooking(null)
    }
  }

  // Si el owner no tiene ningún método configurado
  if (!ownerHasStripe && !ownerHasMercadoPago) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">
                Método de pago no configurado
              </h3>
              <p className="text-sm text-yellow-800">
                El propietario aún no ha configurado un método de pago para recibir alquileres.
                Por favor, contacta con {ownerName} para más información.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Selector de fechas */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de inicio
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors py-3 text-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de fin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors py-3 text-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
        </div>

        {/* Selector de método de pago */}
        {ownerHasStripe && ownerHasMercadoPago && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Método de Pago</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'mercadopago')}>
              {/* Opción Stripe */}
              {ownerHasStripe && (
                <Card className={`cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="stripe" id="stripe" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer">
                          <Shield className="h-5 w-5 text-emerald-600" />
                          <span className="font-semibold">Stripe (Pago con Garantía)</span>
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          El pago se retiene hasta que recibas el artículo. Mayor protección para ambas partes.
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 w-fit px-2 py-1 rounded">
                          <Shield className="h-3 w-3" />
                          <span>Recomendado - Con escrow</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Opción MercadoPago */}
              {ownerHasMercadoPago && (
                <Card className={`cursor-pointer transition-all ${paymentMethod === 'mercadopago' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="mercadopago" id="mercadopago" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="mercadopago" className="flex items-center gap-2 cursor-pointer">
                          <Zap className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold">MercadoPago (Pago Directo)</span>
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          El propietario recibe el pago de inmediato. Sin retención de garantía.
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 w-fit px-2 py-1 rounded">
                          <AlertCircle className="h-3 w-3" />
                          <span>Sin escrow - Pago inmediato</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </RadioGroup>
          </div>
        )}

        {/* Resumen de precio */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-700">
              ${price} × {totalDays} día{totalDays !== 1 ? 's' : ''}
            </span>
            <span className="font-medium">${price * totalDays}</span>
          </div>
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-700">Comisión de servicio (10%)</span>
            <span className="font-medium">${Math.round(price * totalDays * 0.1)}</span>
          </div>
          <div className="border-t border-gray-300 pt-2 mt-2 font-bold text-gray-900 flex justify-between">
            <span>Total</span>
            <span>${totalPrice}</span>
          </div>
        </div>

        {/* Advertencia según método */}
        {paymentMethod === 'stripe' && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <Shield className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800 text-sm">
              <strong>Pago seguro:</strong> El dinero se retendrá hasta que el propietario confirme la entrega del artículo.
            </AlertDescription>
          </Alert>
        )}

        {paymentMethod === 'mercadopago' && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-sm">
              <strong>Pago inmediato:</strong> El propietario recibirá el dinero de inmediato. No hay retención de garantía.
            </AlertDescription>
          </Alert>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !!error}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Continuar al Pago
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Al continuar, aceptarás los términos y condiciones del alquiler
        </p>
      </form>

      {/* Modal de términos y condiciones */}
      <TermsModal
        open={showTermsModal}
        onOpenChange={setShowTermsModal}
        onAccept={handleAcceptTerms}
        paymentMethod={paymentMethod}
      />
    </>
  )
}
