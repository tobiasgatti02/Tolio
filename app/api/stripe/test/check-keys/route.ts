import { NextResponse } from 'next/server';

/**
 * Endpoint de diagnóstico para verificar las claves de Stripe
 * Solo para desarrollo
 */
export async function GET() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  return NextResponse.json({
    publishableKey: {
      exists: !!publishableKey,
      firstChars: publishableKey?.substring(0, 20),
      lastChars: publishableKey?.slice(-10),
      length: publishableKey?.length,
      isTest: publishableKey?.startsWith('pk_test_'),
    },
    secretKey: {
      exists: !!secretKey,
      firstChars: secretKey?.substring(0, 20),
      lastChars: secretKey?.slice(-10),
      length: secretKey?.length,
      isTest: secretKey?.startsWith('sk_test_'),
    },
    timestamp: new Date().toISOString(),
  });
}
