'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Wallet, CheckCircle, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function StripeConnectOnboarding() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stripe/create-connected-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear cuenta de Stripe')
      }

      // Redirigir a Stripe para completar el onboarding
      if (data.accountLinkUrl) {
        window.location.href = data.accountLinkUrl
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-emerald-600" />
          Configurar Cuenta de Pagos
        </CardTitle>
        <CardDescription>
          Conecta tu cuenta de Stripe para recibir pagos cuando alquiles tus artículos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">¿Por qué necesito esto?</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Para recibir pagos directamente en tu cuenta bancaria</li>
            <li>Stripe procesa los pagos de forma segura</li>
            <li>El dinero llega automáticamente cuando completas un alquiler</li>
            <li>Solo toma 5 minutos configurarlo</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Qué necesitas tener listo:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ Tu identificación oficial (INE/Pasaporte)</li>
            <li>✓ Información de tu cuenta bancaria</li>
            <li>✓ RFC (para México)</li>
            <li>✓ Dirección completa</li>
          </ul>
        </div>

        <Button 
          onClick={handleConnect}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Conectando con Stripe...
            </>
          ) : (
            <>
              <Wallet className="h-5 w-5 mr-2" />
              Conectar Cuenta de Stripe
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Serás redirigido a Stripe para completar tu registro de forma segura
        </p>
      </CardContent>
    </Card>
  )
}
