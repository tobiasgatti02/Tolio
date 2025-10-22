"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Loader2 } from "lucide-react"

export default function MercadoPagoConnect() {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    try {
      setLoading(true)
      
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
      setLoading(false)
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-900">Conectar MercadoPago</CardTitle>
        <CardDescription className="text-blue-700">
          Conecta tu cuenta de MercadoPago para recibir pagos directos (sin retención)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>⚠️ Pago Directo:</strong> Con MercadoPago, recibirás el dinero de inmediato.
              No hay retención de pago como garantía.
            </p>
            <p>
              La plataforma cobrará una comisión del <strong>5%</strong> sobre cada transacción.
            </p>
          </div>
          
          <Button
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirigiendo...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Conectar Cuenta de MercadoPago
              </>
            )}
          </Button>

          <p className="text-xs text-blue-600">
            Serás redirigido a MercadoPago para autorizar el acceso a tu cuenta.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
