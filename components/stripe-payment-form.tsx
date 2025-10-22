'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, CreditCard, Lock, AlertCircle, Loader2 } from 'lucide-react';

// Inicializar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentFormProps {
  bookingId: string;
  amount: number;
  itemTitle: string;
  ownerName: string;
  onSuccess?: (paymentIntentId: string) => void;
  testMode?: boolean; // Si es true, usa endpoints de testing
}

function PaymentForm({ bookingId, amount, itemTitle, ownerName, onSuccess, testMode = false }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // Crear PaymentIntent al montar el componente
  useEffect(() => {
    createPaymentIntent();
  }, [bookingId]);

  const createPaymentIntent = async () => {
    try {
      const endpoint = testMode 
        ? '/api/stripe/test/create-payment-intent'
        : '/api/stripe/create-payment-intent';
      
      const body = testMode
        ? { amount }
        : { bookingId, amount };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear PaymentIntent');
      }

      setClientSecret(data.clientSecret);
      setPaymentDetails(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Error al obtener la tarjeta');
      setLoading(false);
      return;
    }

    try {
      // Confirmar el pago
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Error al procesar el pago');
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === 'requires_capture') {
        setSuccess(true);
        if (onSuccess) {
          onSuccess(paymentIntent.id);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">¡Pago Autorizado!</CardTitle>
          <CardDescription>Tu pago está en escrow (retenido de forma segura)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Lock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Escrow Activado:</strong> El dinero está retenido de forma segura.
              Será liberado al propietario cuando confirmes que recibiste el artículo.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Artículo:</span>
              <span className="font-medium">{itemTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monto retenido:</span>
              <span className="font-semibold text-green-600">${amount.toFixed(2)} MXN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Propietario:</span>
              <span className="font-medium">{ownerName}</span>
            </div>
          </div>

          <div className="pt-4 space-y-2 text-xs text-gray-500">
            <p>✓ El dinero no será cobrado hasta que confirmes</p>
            <p>✓ Puedes cancelar y obtener reembolso completo</p>
            <p>✓ El propietario no podrá acceder al dinero hasta tu confirmación</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pago Seguro con Escrow
        </CardTitle>
        <CardDescription>
          Tu pago será retenido hasta que confirmes la recepción
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Detalles del pago */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Artículo</span>
              <span className="font-medium">{itemTitle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Propietario</span>
              <span className="font-medium">{ownerName}</span>
            </div>
            <div className="border-t border-blue-200 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total a retener</span>
              <span className="text-2xl font-bold text-blue-600">
                ${paymentDetails?.amount?.toFixed(2) || amount.toFixed(2)} MXN
              </span>
            </div>
            {paymentDetails && (
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Monto al propietario:</span>
                  <span>${paymentDetails.ownerAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee del marketplace (5%):</span>
                  <span>${paymentDetails.marketplaceFee?.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Card Element */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Información de la tarjeta
            </label>
            <div className="border rounded-md p-3 bg-white">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Usa 4242 4242 4242 4242 para pruebas en modo test
            </p>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Escrow info */}
          <Alert className="bg-amber-50 border-amber-200">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              <strong>Pago con Escrow:</strong> Tu dinero estará retenido de forma segura
              hasta que confirmes haber recibido el artículo. No se cobrará hasta tu aprobación.
            </AlertDescription>
          </Alert>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={!stripe || loading || !clientSecret}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Retener ${amount.toFixed(2)} MXN
              </>
            )}
          </Button>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" />
              Seguro
            </Badge>
            <Badge variant="outline">Powered by Stripe</Badge>
            <Badge variant="outline">Escrow</Badge>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function StripePaymentForm(props: StripePaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}