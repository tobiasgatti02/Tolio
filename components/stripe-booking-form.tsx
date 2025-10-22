'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeBookingFormProps {
  itemId: string
  itemTitle: string
  ownerId: string
  ownerName: string
  price: number
}

function BookingFormContent({ itemId, itemTitle, ownerId, ownerName, price }: StripeBookingFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { data: session } = useSession()
  
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const days = calculateDays()
  const totalPrice = days * price
  const platformFee = Math.round(totalPrice * 0.05)
  const ownerAmount = totalPrice - platformFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!session) {
      setError('Debes iniciar sesión para hacer una reserva')
      router.push('/login')
      return
    }

    if (!stripe || !elements) {
      setError('Stripe no está cargado correctamente')
      return
    }

    if (!startDate || !endDate) {
      setError('Selecciona fechas válidas')
      return
    }

    if (days < 1) {
      setError('La reserva debe ser de al menos 1 día')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Elemento de tarjeta no encontrado')
      return
    }

    setLoading(true)

    try {
      // 1. Crear el booking en la base de datos
      const bookingResponse = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          startDate,
          endDate,
          totalPrice,
          ownerId
        })
      })

      if (!bookingResponse.ok) {
        let errorMessage = 'Error al crear la reserva'
        try {
          const errorData = await bookingResponse.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // Si no hay JSON válido, usa el mensaje por defecto
          errorMessage = `Error ${bookingResponse.status}: ${bookingResponse.statusText}`
        }
        throw new Error(errorMessage)
      }

      const booking = await bookingResponse.json()

      // 2. Crear el PaymentIntent con Stripe
      const paymentIntentResponse = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: totalPrice
        })
      })

      if (!paymentIntentResponse.ok) {
        let errorMessage = 'Error al crear el pago'
        try {
          const errorData = await paymentIntentResponse.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          errorMessage = `Error ${paymentIntentResponse.status}: ${paymentIntentResponse.statusText}`
        }
        throw new Error(errorMessage)
      }

      const { clientSecret, paymentIntentId } = await paymentIntentResponse.json()

      // 3. Confirmar el pago con la tarjeta
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      if (paymentIntent?.status === 'requires_capture') {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/bookings/${booking.id}`)
        }, 2000)
      }

    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-emerald-500 bg-emerald-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-lg font-semibold text-emerald-700 mb-2">¡Pago Autorizado!</h3>
            <p className="text-sm text-emerald-600">
              Tu pago de ${totalPrice} MXN está retenido de forma segura.
            </p>
            <p className="text-xs text-emerald-600 mt-2">
              El dinero se transferirá a {ownerName} cuando confirmes que recibiste el artículo.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="startDate">Fecha de inicio</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div>
        <Label htmlFor="endDate">Fecha de fin</Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          min={startDate || new Date().toISOString().split('T')[0]}
        />
      </div>

      {days > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>{price} MXN × {days} días</span>
            <span>{totalPrice} MXN</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Comisión del marketplace (5%)</span>
            <span>-{platformFee} MXN</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>El dueño recibirá</span>
            <span>{ownerAmount} MXN</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total a pagar</span>
            <span>{totalPrice} MXN</span>
          </div>
        </div>
      )}

      <div className="border rounded-lg p-4 bg-white">
        <Label className="mb-2 block">Información de tarjeta</Label>
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
        <p className="font-semibold mb-1">💡 Cómo funciona el pago seguro:</p>
        <ol className="text-xs space-y-1 ml-4 list-decimal">
          <li>Tu pago se autoriza pero NO se cobra todavía</li>
          <li>El dinero queda retenido de forma segura por Stripe</li>
          <li>Cuando confirmes que recibiste el artículo, se transferirá a {ownerName}</li>
          <li>El marketplace retiene una comisión del 5%</li>
        </ol>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={loading || !stripe || days < 1}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <Calendar className="animate-spin h-4 w-4 mr-2" />
            Procesando...
          </span>
        ) : (
          `Autorizar pago de ${totalPrice} MXN`
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Usa la tarjeta de prueba: 4242 4242 4242 4242
      </p>
    </form>
  )
}

export default function StripeBookingForm(props: StripeBookingFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <BookingFormContent {...props} />
    </Elements>
  )
}
