import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { stripe, calculatePaymentAmounts, toStripeAmount } from '@/lib/stripe';

/**
 * POST /api/stripe/test/create-payment-intent
 * Versión de testing que NO requiere un booking real
 * Solo para desarrollo/testing
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({
        error: 'amount es requerido'
      }, { status: 400 });
    }

    // Calcular montos
    const { totalAmount, marketplaceFee, ownerAmount } = calculatePaymentAmounts(amount);

    // Crear PaymentIntent de prueba sin Customer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeAmount(totalAmount),
      currency: 'mxn',
      capture_method: 'manual', // ESCROW
      description: 'Test Payment - Demo de 3 Actores',
      metadata: {
        test: 'true',
        userId: session.user.email,
        ownerAmount: ownerAmount.toString(),
        marketplaceFee: marketplaceFee.toString(),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      marketplaceFee,
      ownerAmount,
    });

  } catch (error: any) {
    console.error('Error creating test payment intent:', error);
    return NextResponse.json({
      error: error.message || 'Error al crear payment intent'
    }, { status: 500 });
  }
}
