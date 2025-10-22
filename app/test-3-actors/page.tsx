'use client';

import { useState } from 'react';
import { StripePaymentForm } from '@/components/stripe-payment-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Store, 
  Building2, 
  ArrowRight, 
  DollarSign, 
  CheckCircle2,
  Clock,
  Wallet,
  CreditCard
} from 'lucide-react';

export default function Test3ActorsPage() {
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data
  const AMOUNT = 100.00;
  const MARKETPLACE_FEE = 5.00;
  const OWNER_AMOUNT = 95.00;

  const handleCapture = async () => {
    if (!paymentIntentId) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/test/capture-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId }),
      });

      if (res.ok) {
        setIsCaptured(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            👥 Vista de 3 Actores
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            A (Renter) → B (Owner) → C (Marketplace)
          </p>
        </div>

        {/* Flow Diagram */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>💰 Flujo de Dinero: $100 MXN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              {/* A - Renter */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <User className="text-blue-600" />
                  <span className="font-bold">A (Renter)</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Paga</p>
                  <p className="text-2xl font-bold text-blue-600">$100</p>
                  <Badge variant={!paymentIntentId ? "default" : "secondary"} className="mt-2">
                    {!paymentIntentId ? "Esperando pago" : isCaptured ? "Cobrado" : "Retenido"}
                  </Badge>
                </div>
              </div>

              <ArrowRight className="text-slate-400 flex-shrink-0" />

              {/* B - Owner */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Store className="text-green-600" />
                  <span className="font-bold">B (Owner)</span>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Recibe</p>
                  <p className="text-2xl font-bold text-green-600">$95</p>
                  <Badge variant={isCaptured ? "default" : "secondary"} className="mt-2">
                    {isCaptured ? "✅ Recibido" : "⏳ Pendiente"}
                  </Badge>
                </div>
              </div>

              <ArrowRight className="text-slate-400 flex-shrink-0" />

              {/* C - Marketplace */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="text-purple-600" />
                  <span className="font-bold">C (Marketplace)</span>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Fee</p>
                  <p className="text-2xl font-bold text-purple-600">$5</p>
                  <Badge variant={isCaptured ? "default" : "secondary"} className="mt-2">
                    {isCaptured ? "✅ Recibido" : "⏳ Pendiente"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="renter" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="renter" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              A (Renter)
            </TabsTrigger>
            <TabsTrigger value="owner" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              B (Owner)
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              C (Marketplace)
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: RENTER (A) */}
          <TabsContent value="renter" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="text-blue-600" />
                  Vista de A (Renter)
                </CardTitle>
                <CardDescription>
                  A alquila una bicicleta de B por $100 MXN
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status del Renter */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">📊 Mi Estado</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Balance en banco:</span>
                      <span className="font-semibold">
                        {!paymentIntentId ? "$1,000" : isCaptured ? "$900" : "$1,000 (reservados $100)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estado del pago:</span>
                      <Badge variant={!paymentIntentId ? "outline" : isCaptured ? "default" : "secondary"}>
                        {!paymentIntentId ? "Sin pagar" : isCaptured ? "Cobrado" : "Retenido"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                {!paymentIntentId ? (
                  <div>
                    <h4 className="font-semibold mb-3">💳 Pagar Alquiler</h4>
                    <StripePaymentForm
                      bookingId="test_booking_123"
                      amount={AMOUNT}
                      itemTitle="Bicicleta de Montaña"
                      ownerName="Juan Pérez (Owner B)"
                      testMode={true}
                      onSuccess={(piId: string) => {
                        setPaymentIntentId(piId);
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-3" />
                    <h4 className="font-bold text-lg mb-2">
                      {isCaptured ? "¡Pago Completado!" : "¡Pago Autorizado!"}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {isCaptured 
                        ? "El dinero fue cobrado y transferido al owner"
                        : "Tu pago está retenido de forma segura hasta que el owner confirme la entrega"
                      }
                    </p>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {paymentIntentId}
                    </Badge>
                  </div>
                )}

                {/* Timeline */}
                <div className="border-l-2 border-slate-300 dark:border-slate-700 pl-4 space-y-4">
                  <div className={paymentIntentId ? "opacity-100" : "opacity-50"}>
                    <div className="flex items-center gap-2 mb-1">
                      {paymentIntentId ? (
                        <CheckCircle2 className="text-green-600 h-5 w-5" />
                      ) : (
                        <Clock className="text-slate-400 h-5 w-5" />
                      )}
                      <span className="font-semibold">Paso 1: Autorizar Pago</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Tu tarjeta fue autorizada por $100. El dinero está retenido.
                    </p>
                  </div>

                  <div className={isCaptured ? "opacity-100" : "opacity-50"}>
                    <div className="flex items-center gap-2 mb-1">
                      {isCaptured ? (
                        <CheckCircle2 className="text-green-600 h-5 w-5" />
                      ) : (
                        <Clock className="text-slate-400 h-5 w-5" />
                      )}
                      <span className="font-semibold">Paso 2: Owner Confirma</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      El owner confirma que te entregó el artículo.
                    </p>
                  </div>

                  <div className={isCaptured ? "opacity-100" : "opacity-50"}>
                    <div className="flex items-center gap-2 mb-1">
                      {isCaptured ? (
                        <CheckCircle2 className="text-green-600 h-5 w-5" />
                      ) : (
                        <Clock className="text-slate-400 h-5 w-5" />
                      )}
                      <span className="font-semibold">Paso 3: Pago Completado</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      El dinero fue cobrado de tu tarjeta y transferido.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: OWNER (B) */}
          <TabsContent value="owner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="text-green-600" />
                  Vista de B (Owner)
                </CardTitle>
                <CardDescription>
                  B es el propietario de la bicicleta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status del Owner */}
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">📊 Mi Estado</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Balance en Stripe Connect:</span>
                      <span className="font-semibold text-green-600">
                        {isCaptured ? "$95.00 MXN" : "$0.00 MXN"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pagos pendientes:</span>
                      <span className="font-semibold">
                        {paymentIntentId && !isCaptured ? "$95.00 MXN (retenido)" : "$0.00 MXN"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estado:</span>
                      <Badge variant={isCaptured ? "default" : "secondary"}>
                        {isCaptured ? "Pago recibido" : paymentIntentId ? "Esperando entrega" : "Sin reservas"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Acciones del Owner */}
                {paymentIntentId && !isCaptured && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-500 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="text-yellow-600" />
                      Acción Requerida
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      El renter ya autorizó el pago de $100. Cuando entregues el artículo, 
                      confirma la entrega para recibir tu pago de $95.
                    </p>
                    <Button 
                      onClick={handleCapture} 
                      disabled={loading}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? "Procesando..." : "✅ Confirmar Entrega y Recibir $95"}
                    </Button>
                  </div>
                )}

                {isCaptured && (
                  <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-3" />
                    <h4 className="font-bold text-lg mb-2">¡Pago Recibido!</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Recibiste $95 MXN en tu cuenta de Stripe Connect
                    </p>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Monto total del alquiler:</span>
                        <span className="font-semibold">$100.00 MXN</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                        <span className="text-sm">Fee del marketplace (5%):</span>
                        <span>-$5.00 MXN</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between items-center">
                        <span className="font-semibold">Tu ganancia:</span>
                        <span className="font-bold text-green-600 text-lg">$95.00 MXN</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stripe Connect Info */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Tu Cuenta de Stripe Connect
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Los pagos llegan a tu cuenta Connect y puedes retirarlos a tu banco.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Dashboard de Stripe →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: MARKETPLACE (C) */}
          <TabsContent value="marketplace" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="text-purple-600" />
                  Vista de C (Marketplace - Prestar)
                </CardTitle>
                <CardDescription>
                  El marketplace cobra 5% por cada transacción
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status del Marketplace */}
                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">📊 Balance del Marketplace</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Fees acumulados:</span>
                      <span className="font-semibold text-purple-600">
                        {isCaptured ? "$5.00 MXN" : "$0.00 MXN"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fees pendientes:</span>
                      <span className="font-semibold">
                        {paymentIntentId && !isCaptured ? "$5.00 MXN" : "$0.00 MXN"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Disponible para retiro:</span>
                      <span className="font-semibold">
                        {isCaptured ? "$5.00 MXN" : "$0.00 MXN"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transacciones */}
                <div>
                  <h4 className="font-semibold mb-3">📈 Transacciones</h4>
                  <div className="space-y-2">
                    {!paymentIntentId ? (
                      <div className="text-center py-8 text-slate-400">
                        <DollarSign className="mx-auto h-12 w-12 mb-2" />
                        <p className="text-sm">Sin transacciones aún</p>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">Alquiler: Bicicleta de Montaña</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              A → B
                            </p>
                          </div>
                          <Badge variant={isCaptured ? "default" : "secondary"}>
                            {isCaptured ? "Completado" : "Pendiente"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center text-sm pt-3 border-t">
                          <div>
                            <p className="text-slate-600 dark:text-slate-400">Total</p>
                            <p className="font-semibold">$100.00</p>
                          </div>
                          <div>
                            <p className="text-slate-600 dark:text-slate-400">A Owner</p>
                            <p className="font-semibold text-green-600">$95.00</p>
                          </div>
                          <div>
                            <p className="text-slate-600 dark:text-slate-400">Fee (5%)</p>
                            <p className="font-semibold text-purple-600">$5.00</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resumen */}
                {isCaptured && (
                  <div className="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg">
                    <h4 className="font-bold text-lg mb-4 text-center">💰 Resumen de Ingresos</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          Total Procesado
                        </p>
                        <p className="text-2xl font-bold">$100</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          Tus Fees
                        </p>
                        <p className="text-2xl font-bold text-purple-600">$5</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stripe Dashboard */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Stripe Dashboard
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Monitorea todos los pagos, transfers y fees en tu dashboard de Stripe.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Payment Intents →
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Transfers →
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Application Fees →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Instructions */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2">
          <CardHeader>
            <CardTitle>🎯 Cómo Usar Esta Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>1. Tab "A (Renter)":</strong> Autoriza el pago con tarjeta 4242 4242 4242 4242</p>
            <p><strong>2. Tab "B (Owner)":</strong> Confirma la entrega para recibir $95</p>
            <p><strong>3. Tab "C (Marketplace)":</strong> Ve los fees acumulados ($5)</p>
            <p className="pt-2 text-slate-600 dark:text-slate-400">
              💡 <strong>Tip:</strong> Abre el Stripe Dashboard en otra pestaña para ver las transacciones en tiempo real
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
