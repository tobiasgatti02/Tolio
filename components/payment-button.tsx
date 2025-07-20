"use client"

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface PaymentButtonProps {
  bookingId: string
  amount: number
  onPaymentStart?: () => void
}

export default function PaymentButton({ bookingId, amount, onPaymentStart }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePayment = async () => {
    if (onPaymentStart) {
      onPaymentStart()
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/payment/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el pago')
      }

      if (data.success && data.payment) {
        // Usar sandbox para desarrollo
        const paymentUrl = data.payment.sandboxInitPoint || data.payment.initPoint
        
        if (paymentUrl) {
          // Redirigir a MercadoPago
          window.location.href = paymentUrl
        } else {
          throw new Error('No se pudo obtener la URL de pago')
        }
      } else {
        throw new Error('Error al procesar el pago')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: "Error al procesar el pago",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Preparando pago...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pagar ${amount.toLocaleString()}
        </>
      )}
    </button>
  )
}
