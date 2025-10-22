import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { stripe, calculatePaymentAmounts, toStripeAmount } from '@/lib/stripe';

const prisma = new PrismaClient();

/**
 * POST /api/stripe/create-payment-intent
 * Crea un PaymentIntent con captura manual (escrow)
 * 
 * Body: {
 *   bookingId: string,
 *   amount: number (en dólares)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, amount } = body;

    if (!bookingId || !amount || amount <= 0) {
      return NextResponse.json({
        error: 'bookingId y amount son requeridos'
      }, { status: 400 });
    }

    // Buscar el booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        item: {
          include: {
            owner: true
          }
        },
        borrower: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario sea el borrower
    if (booking.borrower.email !== session.user.email) {
      return NextResponse.json({
        error: 'No autorizado para este booking'
      }, { status: 403 });
    }

    // Verificar que el owner tenga cuenta de Stripe Connect
    if (!booking.item.owner.stripeAccountId) {
      return NextResponse.json({
        error: 'El propietario aún no ha configurado su cuenta de pagos'
      }, { status: 400 });
    }

    // Calcular montos
    const { totalAmount, marketplaceFee, ownerAmount } = calculatePaymentAmounts(amount);

    // Crear o actualizar Customer de Stripe
    let customerId = booking.borrower.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: booking.borrower.email,
        name: `${booking.borrower.firstName} ${booking.borrower.lastName}`,
        metadata: {
          userId: booking.borrower.id,
        },
      });
      
      customerId = customer.id;
      
      await prisma.user.update({
        where: { id: booking.borrower.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Crear PaymentIntent con captura manual (ESCROW) y destination charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeAmount(totalAmount), // Convertir a centavos
      currency: 'mxn', // Pesos mexicanos
      customer: customerId,
      capture_method: 'manual', // 🔥 CLAVE: Retener el pago hasta confirmación
      application_fee_amount: toStripeAmount(marketplaceFee), // 5% para el marketplace
      transfer_data: {
        destination: booking.item.owner.stripeAccountId, // Destino: cuenta del owner
      },
      metadata: {
        bookingId: booking.id,
        itemId: booking.item.id,
        ownerId: booking.item.owner.id,
        borrowerId: booking.borrower.id,
        ownerAmount: ownerAmount.toString(),
        marketplaceFee: marketplaceFee.toString(),
        stripeAccountId: booking.item.owner.stripeAccountId,
      },
      description: `Alquiler: ${booking.item.title} - ${booking.id.substring(0, 8)}`,
    });

    // Crear o actualizar registro de Payment
    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        amount: totalAmount,
        marketplaceFee,
        ownerAmount,
        marketplaceAmount: marketplaceFee,
        status: 'PENDING',
        stripePaymentIntentId: paymentIntent.id,
        paymentProvider: 'stripe',
      },
      update: {
        stripePaymentIntentId: paymentIntent.id,
        amount: totalAmount,
        marketplaceFee,
        ownerAmount,
        marketplaceAmount: marketplaceFee,
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
    console.error('Error creating payment intent:', error);
    return NextResponse.json({
      error: 'Error al crear PaymentIntent',
      details: error.message,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}