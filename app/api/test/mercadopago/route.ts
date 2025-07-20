import { NextRequest, NextResponse } from 'next/server'
import { paymentConfig, createPaymentPreference } from '@/lib/mercadopago'

export async function GET(request: NextRequest) {
  try {
    // Crear una preferencia de prueba para verificar que las credenciales funcionan
    const testData = {
      bookingId: 'test-booking-123',
      amount: 100,
      title: 'Test Payment',
      description: 'Testing MercadoPago integration',
      userEmail: 'test@example.com',
      userName: 'Test User'
    }

    const preference = await createPaymentPreference(testData)
    
    return NextResponse.json({
      success: true,
      message: 'MercadoPago credentials are working!',
      preferenceId: preference.preferenceId,
      environment: paymentConfig.environment,
      publicKey: paymentConfig.publicKey,
      initPoint: preference.initPoint,
      sandboxInitPoint: preference.sandboxInitPoint
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
