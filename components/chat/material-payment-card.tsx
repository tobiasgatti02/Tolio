"use client"

import { useState } from 'react'
import { Package, DollarSign, CheckCircle2, Loader2, CreditCard } from 'lucide-react'

interface Material {
  name: string
  price: number
}

interface MaterialPaymentCardProps {
  materials: Material[]
  totalAmount: number
  status: 'pending' | 'paid'
  materialPaymentId: string
  bookingId: string
  onPay?: () => void
}

export default function MaterialPaymentCard({
  materials,
  totalAmount,
  status,
  materialPaymentId,
  bookingId,
  onPay,
}: MaterialPaymentCardProps) {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    if (!onPay) return
    
    setLoading(true)
    try {
      await onPay()
    } catch (error) {
      console.error('Error initiating payment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`
      max-w-md rounded-2xl shadow-lg border-2 overflow-hidden
      ${status === 'paid' 
        ? 'bg-green-50 border-green-300' 
        : 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-300'
      }
      animate-in slide-in-from-bottom-4 duration-300
    `}>
      {/* Header */}
      <div className={`
        p-4 flex items-center gap-3
        ${status === 'paid' ? 'bg-green-100' : 'bg-orange-100'}
      `}>
        {status === 'paid' ? (
          <>
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-bold text-green-900">Materiales Pagados</h3>
              <p className="text-sm text-green-700">Pago completado exitosamente</p>
            </div>
          </>
        ) : (
          <>
            <Package className="h-6 w-6 text-orange-600" />
            <div>
              <h3 className="font-bold text-orange-900">Solicitud de Materiales</h3>
              <p className="text-sm text-orange-700">Se requiere pago anticipado</p>
            </div>
          </>
        )}
      </div>

      {/* Materials List */}
      <div className="p-4 space-y-2">
        <h4 className="font-semibold text-gray-900 mb-3">Materiales requeridos:</h4>
        <div className="space-y-2">
          {materials.map((material, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm"
            >
              <span className="text-gray-700">{material.name}</span>
              <span className="font-semibold text-gray-900">
                ${material.price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className={`
          mt-4 p-4 rounded-xl flex justify-between items-center
          ${status === 'paid' ? 'bg-green-100' : 'bg-orange-100'}
        `}>
          <span className="font-bold text-gray-900">Total:</span>
          <span className={`
            text-2xl font-bold
            ${status === 'paid' ? 'text-green-700' : 'text-orange-700'}
          `}>
            ${totalAmount.toFixed(2)}
          </span>
        </div>

        {/* Action Button */}
        {status === 'pending' && onPay && (
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Pagar Materiales
              </>
            )}
          </button>
        )}

        {status === 'paid' && (
          <div className="mt-4 bg-white border-2 border-green-300 rounded-xl p-3 text-center">
            <p className="text-sm text-green-700 font-medium">
              ✓ El proveedor puede proceder con el trabajo
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className={`
        px-4 py-3 text-xs text-center
        ${status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}
      `}>
        {status === 'pending' 
          ? '💡 Este pago va 100% al proveedor para comprar los materiales'
          : '✓ Pago procesado de forma segura'
        }
      </div>
    </div>
  )
}
