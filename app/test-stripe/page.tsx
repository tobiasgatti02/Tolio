'use client';

import { useState } from 'react';
import { StripePaymentForm } from '@/components/stripe-payment-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function TestStripePage() {
  const [step, setStep] = useState<'config' | 'payment' | 'capture' | 'refund'>('config');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Mock data
  const [bookingId] = useState('booking_test_123');
  const [amount] = useState(100.00);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [ownerAccountId, setOwnerAccountId] = useState<string | null>(null);

  // Crear cuenta Connect
  const handleCreateConnectAccount = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/stripe/create-connected-account', {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear cuenta Connect');
      }

      const data = await res.json();
      setOwnerAccountId(data.stripeAccountId);
      setSuccess(`✅ Cuenta Connect creada: ${data.stripeAccountId}`);
      
      // Abrir URL de onboarding
      if (data.onboardingUrl) {
        window.open(data.onboardingUrl, '_blank');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Capturar pago
  const handleCapturePayment = async () => {
    if (!paymentIntentId) {
      setError('No hay PaymentIntent para capturar');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/stripe/capture-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al capturar pago');
      }

      const data = await res.json();
      setSuccess(`✅ Pago capturado! Transfer: ${data.transfer.id}`);
      setStep('refund');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reembolsar pago
  const handleRefundPayment = async (amount?: number) => {
    if (!paymentIntentId) {
      setError('No hay PaymentIntent para reembolsar');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/stripe/refund-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paymentIntentId,
          ...(amount && { amount }),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al reembolsar');
      }

      const data = await res.json();
      setSuccess(`✅ Reembolso exitoso! Refund: ${data.refund?.id || 'Cancelado'}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setStep('config');
    setPaymentIntentId(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🧪 Test de Stripe Escrow
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Prueba completa del sistema de pagos con retención de fondos
          </p>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso del Test</CardTitle>
            <CardDescription>Sigue estos pasos en orden</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {[
                { id: 'config', label: 'Configuración' },
                { id: 'payment', label: 'Pago' },
                { id: 'capture', label: 'Captura' },
                { id: 'refund', label: 'Reembolso' },
              ].map((s, idx) => (
                <div key={s.id} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step === s.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="ml-2 hidden sm:inline">{s.label}</span>
                  {idx < 3 && (
                    <div className="w-12 sm:w-24 h-0.5 bg-slate-200 dark:bg-slate-700 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {error && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-950">
            <CardContent className="flex items-center gap-2 pt-6">
              <AlertCircle className="text-red-600" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardContent className="flex items-center gap-2 pt-6">
              <Check className="text-green-600" />
              <p className="text-green-600 dark:text-green-400">{success}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={step} onValueChange={(v) => setStep(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config">Setup</TabsTrigger>
            <TabsTrigger value="payment">Pago</TabsTrigger>
            <TabsTrigger value="capture">Captura</TabsTrigger>
            <TabsTrigger value="refund">Refund</TabsTrigger>
          </TabsList>

          {/* TAB 1: Configuración */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paso 1: Crear Cuenta Connect (Owner)</CardTitle>
                <CardDescription>
                  El propietario debe tener una cuenta de Stripe Connect para recibir pagos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">ℹ️ ¿Qué hace esto?</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• Crea una cuenta de Stripe Connect Express</li>
                    <li>• Genera un link de onboarding</li>
                    <li>• Guarda el stripeAccountId en la base de datos</li>
                  </ul>
                </div>

                {ownerAccountId && (
                  <Badge variant="secondary" className="text-xs font-mono">
                    {ownerAccountId}
                  </Badge>
                )}

                <Button
                  onClick={handleCreateConnectAccount}
                  disabled={loading}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Cuenta Connect'
                  )}
                </Button>

                <Button
                  onClick={() => setStep('payment')}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  Siguiente: Procesar Pago →
                </Button>
              </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📋 Variables de Entorno</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-mono text-xs bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
                      STRIPE_SECRET_KEY
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {process.env.STRIPE_SECRET_KEY ? '✅ Configurado' : '❌ Falta'}
                    </p>
                  </div>
                  <div>
                    <span className="font-mono text-xs bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
                      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                        ? '✅ Configurado'
                        : '❌ Falta'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💳 Tarjetas de Prueba</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-mono text-xs">4242 4242 4242 4242</span>
                    <p className="text-slate-600 dark:text-slate-400">✅ Éxito</p>
                  </div>
                  <div>
                    <span className="font-mono text-xs">4000 0000 0000 0002</span>
                    <p className="text-slate-600 dark:text-slate-400">❌ Decline</p>
                  </div>
                  <div>
                    <span className="font-mono text-xs">4000 0025 0000 3155</span>
                    <p className="text-slate-600 dark:text-slate-400">🔐 Requiere 3D Secure</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: Pago */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paso 2: Autorizar Pago (Renter)</CardTitle>
                <CardDescription>
                  El inquilino autoriza el pago. El dinero se retiene pero NO se cobra aún.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold mb-2">ℹ️ ¿Qué sucede aquí?</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• Se crea un PaymentIntent con capture_method: manual</li>
                    <li>• Se autoriza la tarjeta del inquilino</li>
                    <li>• El dinero NO se cobra (status: requires_capture)</li>
                    <li>• Los fondos quedan retenidos en escrow</li>
                  </ul>
                </div>

                <StripePaymentForm
                  bookingId={bookingId}
                  amount={amount}
                  itemTitle="Bicicleta de Montaña (Test)"
                  ownerName="Juan Pérez"
                  onSuccess={(piId: string) => {
                    setPaymentIntentId(piId);
                    setSuccess(`✅ Pago autorizado: ${piId}`);
                    setStep('capture');
                  }}
                />
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-500">
              <CardContent className="pt-6">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Usa la tarjeta <span className="font-mono font-bold">4242 4242 4242 4242</span> para
                  pruebas
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Captura */}
          <TabsContent value="capture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paso 3: Capturar Pago (Owner)</CardTitle>
                <CardDescription>
                  El propietario confirma que entregó el artículo y captura el pago.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">ℹ️ ¿Qué sucede aquí?</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• Se cobra el dinero de la tarjeta del inquilino</li>
                    <li>• Se crea un Transfer al Owner (95%)</li>
                    <li>• El Marketplace retiene su fee (5%)</li>
                    <li>• Status cambia a succeeded</li>
                  </ul>
                </div>

                {paymentIntentId ? (
                  <div className="space-y-3">
                    <Badge variant="secondary" className="font-mono text-xs">
                      PaymentIntent: {paymentIntentId}
                    </Badge>

                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">💰 Distribución del Pago</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span className="font-semibold">${amount.toFixed(2)} MXN</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Owner (95%):</span>
                          <span>${(amount * 0.95).toFixed(2)} MXN</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Marketplace (5%):</span>
                          <span>${(amount * 0.05).toFixed(2)} MXN</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleCapturePayment}
                      disabled={loading}
                      size="lg"
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Capturando...
                        </>
                      ) : (
                        'Capturar Pago y Transferir'
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                    <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                    <p>Primero debes autorizar un pago en el paso anterior</p>
                    <Button variant="outline" onClick={() => setStep('payment')} className="mt-4">
                      ← Volver a Pago
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Refund */}
          <TabsContent value="refund" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paso 4: Reembolsar (Opcional)</CardTitle>
                <CardDescription>
                  Si hay algún problema, puedes reembolsar el pago total o parcialmente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">ℹ️ ¿Qué sucede aquí?</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• Se devuelve el dinero al inquilino</li>
                    <li>• Se puede reembolsar total o parcialmente</li>
                    <li>• Si no se había capturado, simplemente se cancela</li>
                  </ul>
                </div>

                {paymentIntentId ? (
                  <div className="space-y-3">
                    <Badge variant="secondary" className="font-mono text-xs">
                      PaymentIntent: {paymentIntentId}
                    </Badge>

                    <div className="grid gap-3">
                      <Button
                        onClick={() => handleRefundPayment()}
                        disabled={loading}
                        variant="destructive"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          `Reembolsar Total ($${amount.toFixed(2)} MXN)`
                        )}
                      </Button>

                      <Button
                        onClick={() => handleRefundPayment(amount / 2)}
                        disabled={loading}
                        variant="outline"
                        size="lg"
                      >
                        Reembolsar Parcial ($${(amount / 2).toFixed(2)} MXN)
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                    <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                    <p>Primero debes completar un pago</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-950 border-red-500">
              <CardContent className="pt-6">
                <p className="text-sm text-red-800 dark:text-red-200">
                  ⚠️ Los reembolsos son irreversibles. Asegúrate de que sea necesario.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reset Button */}
        <Card>
          <CardContent className="pt-6">
            <Button onClick={resetTest} variant="outline" size="lg" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reiniciar Test
            </Button>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>📚 Documentación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>TESTING.md:</strong> Guía completa de testing con cURLs y scripts
            </p>
            <p>
              <strong>STRIPE_ESCROW.md:</strong> Documentación técnica del sistema
            </p>
            <p>
              <strong>Dashboard de Stripe:</strong>{' '}
              <a
                href="https://dashboard.stripe.com/test/payments"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Ver pagos en tiempo real →
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
