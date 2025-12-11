"use client"

import { useState, useEffect } from 'react'
import { CreditCard, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

interface DLocalOnboardingProps {
  onSuccess?: () => void
}

export default function DLocalOnboarding({ onSuccess }: DLocalOnboardingProps) {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [status, setStatus] = useState<{
    onboarded: boolean
    dlocalAccountId: string | null
    kycStatus: string | null
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setChecking(true)
    try {
      const response = await fetch('/api/dlocal/onboard')
      if (response.ok) {
        const data = await response.json()
        setStatus({
          onboarded: data.onboarded || false,
          dlocalAccountId: data.dlocalAccountId,
          kycStatus: data.kycStatus,
        })
      }
    } catch (error) {
      console.error('Error checking DLocal status:', error)
    } finally {
      setChecking(false)
    }
  }

  const handleOnboard = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/dlocal/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({
          onboarded: true,
          dlocalAccountId: data.dlocalAccountId,
          kycStatus: null,
        })
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError(data.error || 'Error al configurar la cuenta de pagos')
      }
    } catch (error) {
      console.error('Error onboarding:', error)
      setError('Error de conexión. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Verificando estado de pagos...</span>
        </div>
      </div>
    )
  }

  if (status?.onboarded) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">Cuenta de Pagos Configurada</h3>
            <p className="text-sm text-green-700">
              Tu cuenta está lista para recibir pagos
            </p>
            {status.dlocalAccountId && (
              <p className="text-xs text-gray-500 mt-1">
                ID: {status.dlocalAccountId.slice(0, 8)}...
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <CreditCard className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configura tu Cuenta de Pagos</h3>
          <p className="text-sm text-gray-600">
            Habilita tu cuenta para recibir pagos por servicios y materiales
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Recibe pagos de materiales (100% para ti)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Recibe pagos de servicios (98% para ti, 2% comisión)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Transferencias directas a tu cuenta bancaria</span>
        </div>
      </div>

      <button
        onClick={handleOnboard}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Configurando...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Configurar Cuenta de Pagos
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Al continuar, aceptas los términos de servicio de pagos de Prestar
      </p>
    </div>
  )
}
