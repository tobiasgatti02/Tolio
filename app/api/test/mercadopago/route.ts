import { NextRequest, NextResponse } from 'next/server'
import { paymentConfig, preferenceApi } from '@/lib/mercadopago'

export async function GET(request: NextRequest) {
  try {
    // Crear una preferencia de prueba para verificar que las credenciales funcionan
    const testPreference = {
      items: [
        {
          id: 'test-item',
          title: 'Test Payment',
          description: 'Testing MercadoPago integration',
          quantity: 1,
          unit_price: 100,
          currency_id: 'ARS'
        }
      ],
      back_urls: {
        success: paymentConfig.successUrl,
        failure: paymentConfig.failureUrl,
        pending: paymentConfig.pendingUrl
      },
      auto_return: 'approved',
      external_reference: 'test-payment-123'
    }

    const preference = await preferenceApi.create({ body: testPreference })
    
    return NextResponse.json({
      success: true,
      message: 'MercadoPago credentials are working!',
      preferenceId: preference.id,
      environment: paymentConfig.environment,
      publicKey: paymentConfig.publicKey,
      sandboxInitPoint: preference.sandbox_init_point
    })

  } catch (error) {
    console.error('MercadoPago test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'MercadoPago test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
