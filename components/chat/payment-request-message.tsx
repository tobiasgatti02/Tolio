"use client"

import { useState } from 'react'
import { CreditCard, Loader2, CheckCircle } from 'lucide-react'

interface PaymentRequestMessageProps {
  serviceTitle: string
  amount: number
  description?: string
  isPaid?: boolean
  onPay?: () => void | Promise<void>
}

export default function PaymentRequestMessage({
  serviceTitle,
  amount,
  description = 'Incluye materiales y mano de obra',
  isPaid = false,
  onPay,
}: PaymentRequestMessageProps) {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    if (!onPay || loading) return
    setLoading(true)
    try {
      await onPay()
    } catch (error) {
      console.error('Error paying:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isPaid) {
    return (
      <div className="max-w-[280px] rounded-2xl overflow-hidden shadow-lg bg-green-500">
        <div className="p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-white">Pago Completado</h3>
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <p className="text-green-100 text-xs">{serviceTitle}</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-green-100 text-xs">Monto pagado</span>
            <span className="text-xl font-bold text-white">
              ${amount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[280px] rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-orange-500 to-orange-600">
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-white">Solicitud de Pago</h3>
          <CreditCard className="h-5 w-5 text-white/80" />
        </div>
        <p className="text-orange-100 text-xs">{serviceTitle}</p>
        
        <div className="mt-2 bg-white/10 rounded-xl p-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-orange-100 text-xs block">Monto total</span>
              <span className="text-orange-100/70 text-[10px]">{description}</span>
            </div>
            <span className="text-xl font-bold text-white">
              ${amount.toLocaleString()}
            </span>
          </div>
        </div>

        {onPay && (
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full mt-3 bg-white text-orange-600 font-semibold py-2 rounded-xl hover:bg-orange-50 transition-colors disabled:opacity-70 text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </span>
            ) : (
              'Pagar Ahora'
            )}
          </button>
        )}

        <p className="text-center text-orange-100/70 text-[10px] mt-2">
          Transacción segura
        </p>
      </div>
    </div>
  )
}
