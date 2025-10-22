import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { stripe, toStripeAmount } from '@/lib/stripe';

const prisma = new PrismaClient();

/**
 * POST /api/stripe/refund-payment
 * Hace refund del PaymentIntent (total o parcial)
 * 
 * Body: {
 *   paymentIntentId: string,
 *   amount?: number (opcional, si no se envía es refund total)
 *   reason?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { paymentIntentId, amount, reason = 'requested_by_customer' } = body;

    if (!paymentIntentId) {
      return NextResponse.json({
        error: 'paymentIntentId es requerido'
      }, { status: 400 });
    }

    // Buscar el payment
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        booking: {
          include: {
            item: {
              include: {
                owner: true
              }
            },
            borrower: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
    }

    // Solo el marketplace (admin) o el borrower pueden hacer refund
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const isOwner = user.id === payment.booking.item.owner.id;
    const isBorrower = user.id === payment.booking.borrower.id;
    
    if (!isOwner && !isBorrower) {
      return NextResponse.json({
        error: 'No autorizado para hacer refund'
      }, { status: 403 });
    }

    // Verificar estado del pago
    if (payment.status === 'REFUNDED') {
      return NextResponse.json({
        error: 'El pago ya fue reembolsado',
      }, { status: 400 });
    }

    // Si el pago no está capturado, cancelar el PaymentIntent
    if (payment.status === 'PENDING') {
      const canceledIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          refundedAt: new Date(),
          refundAmount: payment.amount,
        },
      });

      await prisma.booking.update({
        where: { id: payment.booking.id },
        data: { status: 'CANCELLED' },
      });

      return NextResponse.json({
        success: true,
        message: 'PaymentIntent cancelado (no se había capturado)',
        paymentIntent: canceledIntent,
      });
    }

    // Si ya está capturado, hacer refund
    const refundAmount = amount
      ? toStripeAmount(amount)
      : toStripeAmount(payment.amount);

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: refundAmount,
      reason,
      metadata: {
        bookingId: payment.booking.id,
        paymentId: payment.id,
      },
    });

    // Actualizar en base de datos
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          refundedAt: new Date(),
          refundAmount: refundAmount / 100,
        },
      }),
      prisma.booking.update({
        where: { id: payment.booking.id },
        data: { status: 'CANCELLED' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
      message: 'Reembolso procesado exitosamente',
    });
  } catch (error: any) {
    console.error('Error processing refund:', error);
    return NextResponse.json({
      error: 'Error al procesar el reembolso',
      details: error.message,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}