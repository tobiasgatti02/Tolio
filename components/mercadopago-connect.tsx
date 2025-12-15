"use client"

import { useState } from "react"
import { Wallet, ExternalLink, CheckCircle2, Shield, TrendingUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MercadoPagoConnect() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    try {
      setIsLoading(true)

      // Obtener la URL de autorización de MercadoPago
      const response = await fetch('/api/mercadopago/auth-url')
      const data = await response.json()

      if (data.url) {
        // Redirigir al usuario a MercadoPago para autorizar
        window.location.href = data.url
      } else {
        throw new Error('No se pudo obtener la URL de autorización')
      }
    } catch (error) {
      console.error('Error connecting to MercadoPago:', error)
      alert('Error al conectar con MercadoPago. Por favor, intenta de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 shadow-md">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">MercadoPago - Pagos de Servicios</h2>
              <p className="mt-1 text-sm text-gray-600">
                Conecta tu cuenta para recibir pagos por servicios y materiales
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 px-8 py-8">
          {/* Benefits Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Materiales</h3>
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-bold text-green-600">100% para vos</span>
                  <span className="text-gray-500"> (sin comisión)</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Servicios</h3>
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-bold text-blue-600">95% para vos</span>
                  <span className="text-gray-500"> (5% comisión)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <Shield className="h-4 w-4 text-gray-600" />
            <p className="text-sm text-gray-600">Conexión segura mediante OAuth 2.0 de MercadoPago</p>
          </div>

          {/* Connect Button or Success State */}
          {!isConnected ? (
            <>
              <Button
                onClick={handleConnect}
                disabled={isLoading}
                className="group relative w-full overflow-hidden bg-blue-500 py-6 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-600 hover:shadow-xl disabled:opacity-50"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      Conectar Cuenta de MercadoPago
                      <ExternalLink className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </Button>
              <p className="text-center text-xs text-gray-500">
                Serás redirigido a MercadoPago para autorizar el acceso a tu cuenta
              </p>
            </>
          ) : (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div className="text-center">
                  <p className="font-semibold text-green-900">Cuenta Conectada Exitosamente</p>
                  <p className="mt-1 text-sm text-green-700">Ya puedes comenzar a recibir pagos</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
