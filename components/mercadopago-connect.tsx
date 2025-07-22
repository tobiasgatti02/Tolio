"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface MercadoPagoConnectProps {
  user: {
    id: string
    marketplaceAccessToken?: string | null
    marketplaceConnectedAt?: Date | null
  }
}

export default function MercadoPagoConnect({ user }: MercadoPagoConnectProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleConnect = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/mercadopago/connect')
      const data = await response.json()
      
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        console.error('No authorization URL received')
      }
    } catch (error) {
      console.error('Error connecting to MercadoPago:', error)
    } finally {
      setLoading(false)
    }
  }

  const isConnected = !!user.marketplaceAccessToken

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conexión con MercadoPago</CardTitle>
        <CardDescription>
          Conecta tu cuenta de MercadoPago para recibir pagos directamente cuando alguien alquile tus items.
          PRESTAR se queda con una comisión del 2% por cada transacción.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">Conectado a MercadoPago</span>
            </div>
            {user.marketplaceConnectedAt && (
              <p className="text-sm text-gray-500">
                Conectado el {new Date(user.marketplaceConnectedAt).toLocaleDateString()}
              </p>
            )}
            <p className="text-sm text-gray-600">
              Cuando alguien alquile uno de tus items, recibirás el pago directamente en tu cuenta de MercadoPago 
              (menos la comisión del 2% de PRESTAR).
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-600">No conectado a MercadoPago</span>
            </div>
            <p className="text-sm text-gray-600">
              Para recibir pagos cuando alguien alquile tus items, necesitas conectar tu cuenta de MercadoPago.
            </p>
            <Button 
              onClick={handleConnect} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Conectando...' : 'Conectar con MercadoPago'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
