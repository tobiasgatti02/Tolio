import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { stripe } from '@/lib/stripe';

const prisma = new PrismaClient();

/**
 * GET /api/stripe/account-requirements?accountId=acct_xxx
 * Devuelve los requisitos pendientes de una cuenta conectada
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({
        error: 'accountId es requerido'
      }, { status: 400 });
    }

    // Verificar que la cuenta pertenezca al usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.stripeAccountId !== accountId) {
      return NextResponse.json({
        error: 'No autorizado para ver esta cuenta'
      }, { status: 403 });
    }

    // Obtener información detallada de la cuenta
    const account = await stripe.accounts.retrieve(accountId);

    // Analizar requisitos
    const requirements = account.requirements;
    const capabilities = account.capabilities;

    return NextResponse.json({
      accountId: account.id,
      email: account.email,
      country: account.country,
      businessType: account.business_type,
      
      // Estado de capacidades
      capabilities: {
        cardPayments: capabilities?.card_payments,
        transfers: capabilities?.transfers,
      },

      // Estado de habilitación
      enabled: {
        charges: account.charges_enabled,
        payouts: account.payouts_enabled,
        details_submitted: account.details_submitted,
      },

      // Requisitos pendientes
      requirements: {
        currently_due: requirements?.currently_due || [],
        eventually_due: requirements?.eventually_due || [],
        past_due: requirements?.past_due || [],
        pending_verification: requirements?.pending_verification || [],
        disabled_reason: requirements?.disabled_reason || null,
        errors: requirements?.errors || [],
      },

      // Información adicional
      external_accounts: account.external_accounts?.data?.length || 0,
      payouts_enabled: account.payouts_enabled,
      charges_enabled: account.charges_enabled,
      
      // Si necesita completar onboarding
      needsOnboarding: !account.details_submitted || 
                       !account.charges_enabled || 
                       !account.payouts_enabled ||
                       (requirements?.currently_due?.length || 0) > 0,
    });
  } catch (error: any) {
    console.error('Error checking account requirements:', error);
    return NextResponse.json({
      error: 'Error al verificar requisitos',
      details: error.message,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
