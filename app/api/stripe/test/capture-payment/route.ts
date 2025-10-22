import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';

/**
 * POST /api/stripe/test/capture-payment
 * Versión de testing para capturar pagos sin validación de booking
 * Solo para desarrollo/testing
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json({
        error: 'paymentIntentId es requerido'
      }, { status: 400 });
    }

    // Capturar el PaymentIntent
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    // Para testing, no creamos transfers reales
    // Solo capturamos el pago

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
      },
      message: 'Pago de prueba capturado exitosamente',
      note: 'En producción, aquí se crearía un Transfer al Owner',
    });

  } catch (error: any) {
    console.error('Error capturing test payment:', error);
    return NextResponse.json({
      error: error.message || 'Error al capturar pago'
    }, { status: 500 });
  }
}
