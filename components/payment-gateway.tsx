"use client"

import { useState } from 'react'
import { X, CreditCard, Loader2, ExternalLink } from 'lucide-react'

interface PaymentBreakdown {
  serviceAmount?: number
  materialsAmount?: number
  total: number
  platformFee?: number
}

interface PaymentGatewayProps {
  paymentId: string
  checkoutUrl: string
  amount: number
  breakdown?: PaymentBreakdown
  type: 'material' | 'service'
  onSuccess: () => void
  onCancel: () => void
}

export default function PaymentGateway({
  paymentId,
  checkoutUrl,
  amount,
  breakdown,
  type,
  onSuccess,
  onCancel,
}: PaymentGatewayProps) {
  const [loading, setLoading] = useState(false)

  // Detectar si es sandbox de MercadoPago
  const isSandbox = checkoutUrl.includes('sandbox') || checkoutUrl.includes('test')

  const handlePayment = () => {
    setLoading(true)
    // Redirigir al checkout de MercadoPago
    window.location.href = checkoutUrl
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">
                {type === 'material' ? 'Pago de Materiales' : 'Pago de Servicio'}
              </h2>
              <p className="text-blue-100 text-sm">Procesamiento seguro con MercadoPago</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Breakdown */}
        {breakdown && (
          <div className="bg-gray-50 p-4 border-b">
            <h3 className="font-semibold text-gray-900 mb-3">Detalle del pago</h3>
            <div className="space-y-2 text-sm">
              {breakdown.serviceAmount !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Costo del servicio</span>
                  <span className="font-medium">${breakdown.serviceAmount.toFixed(2)}</span>
                </div>
              )}
              {breakdown.materialsAmount !== undefined && breakdown.materialsAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Materiales</span>
                  <span className="font-medium">${breakdown.materialsAmount.toFixed(2)}</span>
                </div>
              )}
              {breakdown.platformFee !== undefined && breakdown.platformFee > 0 && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Comisión del marketplace (2%)</span>
                  <span>${breakdown.platformFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-bold text-lg">
                <span>Total a pagar</span>
                <span className="text-blue-600">${breakdown.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Content */}
        <div className="p-6">
          {isSandbox && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <p className="text-yellow-800 font-medium text-sm">🧪 Modo Sandbox</p>
              <p className="text-yellow-700 text-xs mt-1">
                Este es un entorno de pruebas. No se realizarán cargos reales.
              </p>
            </div>
          )}
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
            <p className="text-gray-600 mb-2">Monto a pagar</p>
            <p className="text-4xl font-bold text-gray-900">
              ${(amount ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Redirigiendo...
              </>
            ) : (
              <>
                <ExternalLink className="h-5 w-5" />
                Continuar al pago
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            Serás redirigido a la pasarela de pago segura de MercadoPago
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t text-center text-sm text-gray-600">
          <p>🔒 Pago seguro procesado por MercadoPago</p>
        </div>
      </div>
    </div>
  )
}
