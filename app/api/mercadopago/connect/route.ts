import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { exchangeCodeForTokens } from "@/lib/mercadopago"
import prisma from "@/lib/prisma"



export async function GET(request: NextRequest) {
  // Extraer locale de la URL o usar 'es' por defecto (definido una sola vez)
  const locale = 'es' // Las rutas API no tienen locale, usar 'es' por defecto
  
  try {
    console.log('[MercadoPago OAuth] Callback received')
    const code = request.nextUrl.searchParams.get("code")
    
    if (!code) {
      console.log('[MercadoPago OAuth] No code received')
      return NextResponse.redirect(new URL(`/${locale}/dashboard/settings?error=no_code`, request.url))
    }

    // Obtener sesión del usuario
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('[MercadoPago OAuth] No session found, redirecting to login')
      const returnUrl = `/${locale}/dashboard/settings?mp_code=${code}&needs_auth=true`
      return NextResponse.redirect(new URL(`/${locale}/login?returnUrl=${encodeURIComponent(returnUrl)}`, request.url))
    }

    // Intercambiar código por tokens
    console.log('[MercadoPago OAuth] Exchanging code for tokens')
    const credentials = await exchangeCodeForTokens(code)
    
    console.log('[MercadoPago OAuth] Credentials received:', {
      hasAccessToken: !!credentials.access_token,
      hasRefreshToken: !!credentials.refresh_token,
      userId: credentials.user_id,
    })

    // Guardar las credenciales en la base de datos
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        mercadopagoAccessToken: credentials.access_token,
        mercadopagoRefreshToken: credentials.refresh_token,
        mercadopagoUserId: credentials.user_id?.toString(),
        mercadopagoConnected: true,
        mercadopagoConnectedAt: new Date(),
      }
    })

    console.log('[MercadoPago OAuth] User updated successfully')
    console.log('[MercadoPago OAuth] User ID:', session.user.id)
    
    // Verificar que se guardó correctamente
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        mercadopagoConnected: true,
        mercadopagoAccessToken: true,
        mercadopagoUserId: true,
      },
    })
    
    console.log('[MercadoPago OAuth] Verification after update:', {
      connected: updatedUser?.mercadopagoConnected,
      hasAccessToken: !!updatedUser?.mercadopagoAccessToken,
      userId: updatedUser?.mercadopagoUserId,
    })

    // Redirigir al usuario de vuelta a settings con éxito
    return NextResponse.redirect(new URL(`/${locale}/dashboard/settings?success=mercadopago_connected`, request.url))
    
  } catch (error) {
    console.error('[MercadoPago OAuth] Error:', error)
    return NextResponse.redirect(new URL(`/${locale}/dashboard/settings?error=mercadopago_connection_failed`, request.url))
  } finally {
    await prisma.$disconnect()
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
