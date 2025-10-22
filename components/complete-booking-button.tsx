'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CompleteBookingButtonProps {
  bookingId: string
  isOwner: boolean
}

export default function CompleteBookingButton({ bookingId, isOwner }: CompleteBookingButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  if (!isOwner) return null

  const handleComplete = async () => {
    if (!confirm('¿Confirmas que ya entregaste el artículo al cliente? El pago se liberará inmediatamente.')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stripe/capture-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al completar la transacción')
      }

      alert('✅ ¡Pago liberado! El dinero fue transferido a tu cuenta de Stripe.')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800 font-semibold mb-1">
          📦 ¿Ya entregaste el artículo?
        </p>
        <p className="text-xs text-yellow-700">
          Al confirmar la entrega, el pago se liberará y recibirás el dinero en tu cuenta de Stripe.
        </p>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      <Button 
        onClick={handleComplete}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirmar Entrega y Liberar Pago
          </>
        )}
      </Button>
    </div>
  )
}
