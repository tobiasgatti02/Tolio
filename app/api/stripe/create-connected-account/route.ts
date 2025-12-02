import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from "@/lib/prisma";
import { stripe } from '@/lib/stripe';



/**
 * POST /api/stripe/create-connected-account
 * Crea una cuenta de Stripe Connect para que un owner pueda recibir pagos
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Si ya tiene cuenta de Stripe, crear nuevo link de onboarding
    if (user.stripeAccountId) {
      const accountLink = await stripe.accountLinks.create({
        account: user.stripeAccountId,
        refresh_url: `${process.env.NEXTAUTH_URL}/stripe-setup?stripe_refresh=true`,
        return_url: `${process.env.NEXTAUTH_URL}/stripe-setup?stripe_success=true`,
        type: 'account_onboarding',
      });

      return NextResponse.json({
        stripeAccountId: user.stripeAccountId,
        accountLinkUrl: accountLink.url,
        existing: true,
      });
    }

    // Crear cuenta de Stripe Connect (Express)
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'MX', // México
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId: user.id,
        email: user.email,
      },
    });

    // Guardar en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeAccountId: account.id,
        stripeOnboarded: false,
      },
    });

    // Crear link de onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXTAUTH_URL}/stripe-setup?stripe_refresh=true`,
      return_url: `${process.env.NEXTAUTH_URL}/stripe-setup?stripe_success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      stripeAccountId: account.id,
      accountLinkUrl: accountLink.url,
      onboardingUrl: accountLink.url,
    });
  } catch (error: any) {
    console.error('Error creating Stripe Connect account:', error);
    return NextResponse.json({
      error: 'Error al crear cuenta de Stripe',
      details: error.message,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
