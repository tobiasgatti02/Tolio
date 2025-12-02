import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from "@/lib/prisma";
import { stripe, toStripeAmount } from '@/lib/stripe';



/**
 * POST /api/stripe/capture-payment
 * Captura el PaymentIntent retenido y transfiere fondos al owner
 * SOLO EL VENDEDOR (OWNER) puede liberar el pago cuando entrega el objeto
 * 
 * Body: {
 *   bookingId: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({
        error: 'bookingId es requerido'
      }, { status: 400 });
    }

    // Buscar el booking con su payment
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        item: {
          include: {
            owner: true
          }
        },
        owner: true,
        borrower: true
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    }

    // ⚠️ VALIDACIÓN CRÍTICA: Solo el OWNER (vendedor) puede liberar el pago
    if (booking.ownerId !== session.user.id) {
      return NextResponse.json({
        error: 'Solo el propietario del artículo puede marcar como completada y liberar el pago'
      }, { status: 403 });
    }

    if (!booking.payment) {
      return NextResponse.json({ error: 'No hay pago asociado a esta reserva' }, { status: 404 });
    }

    const payment = booking.payment;

    // Verificar que el pago no esté ya capturado
    if (payment.status === 'COMPLETED') {
      return NextResponse.json({
        error: 'El pago ya fue capturado',
        payment,
      }, { status: 400 });
    }

    if (!payment.stripePaymentIntentId) {
      return NextResponse.json({
        error: 'No hay PaymentIntent asociado'
      }, { status: 400 });
    }

    // Verificar que el owner tenga cuenta de Stripe conectada
    if (!booking.owner.stripeAccountId) {
      return NextResponse.json({
        error: 'El propietario no tiene una cuenta de Stripe conectada'
      }, { status: 400 });
    }

    // 1. Capturar el PaymentIntent
    // Stripe automáticamente transferirá al owner usando transfer_data
    const capturedIntent = await stripe.paymentIntents.capture(payment.stripePaymentIntentId);

    // 2. Obtener el transfer automático creado por Stripe
    const charges = await stripe.charges.list({
      payment_intent: payment.stripePaymentIntentId,
      limit: 1,
    });
    
    const charge = charges.data[0];
    const transferId = charge?.transfer as string | undefined;

    // 3. Actualizar registros en la base de datos
    await prisma.$transaction([
      // Actualizar payment
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          stripeChargeId: capturedIntent.latest_charge as string,
          stripeTransferId: transferId || null,
          capturedAt: new Date(),
          paidAt: new Date(),
        },
      }),
      // Actualizar booking a COMPLETED (el vendedor entregó el objeto)
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'COMPLETED',
        },
      }),
      // Notificar al comprador que el pago fue liberado
      prisma.notification.create({
        data: {
          type: 'BOOKING_COMPLETED',
          title: 'Transacción completada',
          content: `El propietario confirmó la entrega de "${booking.item.title}". El pago ha sido liberado.`,
          userId: booking.borrowerId,
          bookingId: booking.id,
          itemId: booking.itemId,
          actionUrl: `/bookings/${booking.id}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: capturedIntent.id,
        status: capturedIntent.status,
        amount: capturedIntent.amount / 100,
      },
      transfer: transferId ? {
        id: transferId,
        amount: payment.ownerAmount,
        destination: booking.owner.stripeAccountId,
      } : null,
      message: 'Pago capturado y transferido exitosamente',
    });
  } catch (error: any) {
    console.error('Error capturing payment:', error);
    return NextResponse.json({
      error: 'Error al capturar el pago',
      details: error.message,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
