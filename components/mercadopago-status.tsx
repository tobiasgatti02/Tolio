"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"

interface MercadoPagoStatusProps {
  isConnected: boolean
  mercadopagoUserId?: string | null
  connectedAt?: Date | null
}

export default function MercadoPagoStatus({ 
  isConnected, 
  mercadopagoUserId,
  connectedAt 
}: MercadoPagoStatusProps) {
  const [disconnecting, setDisconnecting] = useState(false)

  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de que deseas desconectar tu cuenta de MercadoPago?')) {
      return
    }

    try {
      setDisconnecting(true)
      const response = await fetch('/api/mercadopago/disconnect', {
        method: 'POST',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        throw new Error('Error al desconectar')
      }
    } catch (error) {
      console.error('Error disconnecting MercadoPago:', error)
      alert('Error al desconectar. Por favor, intenta de nuevo.')
      setDisconnecting(false)
    }
  }

  if (!isConnected) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">
                MercadoPago no configurado
              </h3>
              <p className="text-sm text-yellow-800 mt-1">
                Conecta tu cuenta de MercadoPago para ofrecer esta opción de pago a tus clientes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">
                MercadoPago conectado
              </h3>
              <p className="text-sm text-green-800 mt-1">
                Tu cuenta está lista para recibir pagos directos.
              </p>
              {mercadopagoUserId && (
                <p className="text-xs text-green-700 mt-2">
                  Usuario ID: {mercadopagoUserId}
                </p>
              )}
              {connectedAt && (
                <p className="text-xs text-green-700">
                  Conectado el: {new Date(connectedAt).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            {disconnecting ? 'Desconectando...' : 'Desconectar MercadoPago'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
