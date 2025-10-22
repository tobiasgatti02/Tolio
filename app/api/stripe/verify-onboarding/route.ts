import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { stripe } from '@/lib/stripe';

const prisma = new PrismaClient();

/**
 * POST /api/stripe/verify-onboarding
 * Verifica y actualiza el estado del onboarding después de que el usuario regrese de Stripe
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.stripeAccountId) {
      return NextResponse.json({
        error: 'No tienes cuenta de Stripe'
      }, { status: 404 });
    }

    // Verificar estado en Stripe
    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    
    const isComplete = account.charges_enabled && account.payouts_enabled;
    
    // Actualizar en base de datos
    if (isComplete && !user.stripeOnboarded) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeOnboarded: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      isComplete,
      accountId: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: {
        currently_due: account.requirements?.currently_due || [],
        errors: account.requirements?.errors || [],
      },
    });
  } catch (error: any) {
    console.error('Error verifying onboarding:', error);
    return NextResponse.json({
      error: 'Error al verificar onboarding',
      details: error.message,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
