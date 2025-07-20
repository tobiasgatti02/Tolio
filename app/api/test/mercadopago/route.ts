import { NextRequest, NextResponse } from 'next/server'
import { paymentConfig, createPaymentPreference } from '@/lib/mercadopago'

export async function GET(request: NextRequest) {
  try {
    // Crear una preferencia de prueba para verificar que las credenciales funcionan
    const testData = {
      id: 'test-item',
      title: 'Test Payment',
      price: 100,
      quantity: 1,
      bookingId: 'test-booking-123'
    }

    const preference = await createPaymentPreference(testData)
    
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
