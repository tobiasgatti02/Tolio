import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not allowed in production' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    mercadopago: {
      environment: process.env.MERCADOPAGO_ENVIRONMENT,
      hasAccessTokenSandbox: !!process.env.MERCADOPAGO_ACCESS_TOKEN_SANDBOX,
      hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      hasPublicKeySandbox: !!process.env.MERCADOPAGO_PUBLIC_KEY_SANDBOX,
      hasPublicKey: !!process.env.MERCADOPAGO_PUBLIC_KEY,
      // Solo mostrar primeros caracteres para seguridad
      accessTokenSandboxPrefix: process.env.MERCADOPAGO_ACCESS_TOKEN_SANDBOX?.substring(0, 10) + '...',
      publicKeySandboxPrefix: process.env.MERCADOPAGO_PUBLIC_KEY_SANDBOX?.substring(0, 10) + '...'
    }
  })
}
