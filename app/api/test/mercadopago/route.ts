import { NextRequest, NextResponse } from 'next/server'
import { createPaymentPreference } from '@/lib/mercadopago'

export async function GET(request: NextRequest) {
  try {
    // Crear una preferencia de prueba para verificar que las credenciales funcionan
    const testData = {
      bookingId: 'test-booking-123',
      title: 'Test Payment',
      quantity: 1,
      unit_price: 100,
      userId: 'test-user-123',
      itemId: 'test-item-123'
    }

    const preference = await createPaymentPreference(testData)
    
    return NextResponse.json({
      success: true,
      message: 'MercadoPago credentials are working!',
      preferenceId: preference.id,
      environment: process.env.MERCADOPAGO_ENVIRONMENT || 'production',
      publicKey: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
      initPoint: preference.init_point,
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
