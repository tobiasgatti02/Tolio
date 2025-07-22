import { NextRequest, NextResponse } from "next/server"
import { getAuthorizationUrl } from "../../../../lib/mercadopago"

export async function GET(request: NextRequest) {
  try {
    // Solo funciona en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    // Obtener URL de autorización de MercadoPago
    const authUrl = await getAuthorizationUrl()
    
    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error getting authorization URL:', error)
    return NextResponse.json({ 
      error: 'Failed to get authorization URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
