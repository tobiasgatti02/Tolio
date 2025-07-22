'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, TestTube, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react'

export default function PaymentTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [testData, setTestData] = useState({
    bookingId: '',
    amount: 100,
    description: 'Test de pago marketplace'
  })

  const createTestPayment = async () => {
    try {
      setLoading(true)
      setResult(null)

      const response = await fetch('/api/payment/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: testData.bookingId || 'test-booking-id',
          amount: testData.amount,
          description: testData.description
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult({
          success: true,
          data: data
        })
        
        // Abrir MercadoPago en nueva pestaña
        if (data.initPoint) {
          window.open(data.initPoint, '_blank')
        }
      } else {
        setResult({
          success: false,
          error: data.error || 'Error desconocido'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Error de conexión'
      })
    } finally {
      setLoading(false)
    }
  }

  const testCards = [
    {
      title: 'Tarjeta Aprobada',
      number: '4509 9535 6623 3704',
      cvv: '123',
      expiry: '11/25',
      type: 'success'
    },
    {
      title: 'Tarjeta Rechazada',
      number: '4013 5406 8274 6260',
      cvv: '123', 
      expiry: '11/25',
      type: 'error'
    },
    {
      title: 'Tarjeta Pendiente',
      number: '4009 1753 3280 7030',
      cvv: '123',
      expiry: '11/25', 
      type: 'pending'
    }
  ]

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <TestTube className="h-8 w-8" />
          Test de Pagos Marketplace
        </h1>
        <p className="text-gray-600 mt-2">
          Prueba la integración completa de MercadoPago marketplace con diferentes casos de uso
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de configuración de test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Configurar Test de Pago
            </CardTitle>
            <CardDescription>
              Configura los parámetros para probar un pago marketplace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bookingId">Booking ID (opcional)</Label>
              <Input
                id="bookingId"
                value={testData.bookingId}
                onChange={(e) => setTestData({...testData, bookingId: e.target.value})}
                placeholder="Deja vacío para usar ID de test"
              />
            </div>
            
            <div>
              <Label htmlFor="amount">Monto (ARS)</Label>
              <Input
                id="amount"
                type="number"
                value={testData.amount}
                onChange={(e) => setTestData({...testData, amount: parseFloat(e.target.value)})}
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={testData.description}
                onChange={(e) => setTestData({...testData, description: e.target.value})}
              />
            </div>

            <Button 
              onClick={createTestPayment}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creando preferencia...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Crear Test de Pago
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado del test */}
        <Card>
          <CardHeader>
            <CardTitle>Resultado del Test</CardTitle>
            <CardDescription>
              Resultado de la creación de preferencia de pago
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                {result.success ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Preferencia creada exitosamente</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Error: {result.error}</span>
                  </div>
                )}
                
                {result.data && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-5 h-5" />
                <span>Esperando test...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tarjetas de prueba */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tarjetas de Prueba</CardTitle>
            <CardDescription>
              Usa estas tarjetas para probar diferentes estados de pago en MercadoPago
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testCards.map((card, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{card.title}</h3>
                    <Badge 
                      variant={card.type === 'success' ? 'default' : card.type === 'error' ? 'destructive' : 'secondary'}
                    >
                      {card.type === 'success' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {card.type === 'error' && <XCircle className="w-3 h-3 mr-1" />}
                      {card.type === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {card.type === 'success' ? 'Aprobada' : card.type === 'error' ? 'Rechazada' : 'Pendiente'}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Número:</span>
                      <div className="font-mono">{card.number}</div>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-gray-600">CVV:</span>
                        <div className="font-mono">{card.cvv}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Vencimiento:</span>
                        <div className="font-mono">{card.expiry}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Instrucciones de prueba:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Crea una preferencia de pago usando el botón de arriba</li>
                <li>2. Se abrirá MercadoPago en una nueva pestaña</li>
                <li>3. Usa una de las tarjetas de prueba para simular el pago</li>
                <li>4. El webhook procesará la notificación automáticamente</li>
                <li>5. Verifica el estado en la base de datos o en Prisma Studio</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
