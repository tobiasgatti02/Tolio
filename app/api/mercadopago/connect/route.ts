import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { exchangeCodeForCredentials } from "../../../../lib/mercadopago"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('OAuth callback received')
    const code = request.nextUrl.searchParams.get("code")
    const state = request.nextUrl.searchParams.get("state")
    
    console.log('Code:', !!code)
    console.log('State:', state)
    
    if (!code) {
      console.log('No code received from MercadoPago')
      return NextResponse.redirect(new URL('/dashboard/settings?error=no_code', request.url))
    }

    // Si no hay state, intentamos obtener la sesión actual
    let userId = state
    
    if (!userId) {
      console.log('No state found, trying to get session')
      const session = await getServerSession(authOptions)
      
      if (!session || !session.user || !session.user.id) {
        console.log('No session and no state, redirecting to login with code')
        // Guardar el código temporalmente y redirigir al login
        const returnUrl = `/dashboard/settings?mp_code=${code}&needs_auth=true`
        return NextResponse.redirect(new URL(`/login?returnUrl=${encodeURIComponent(returnUrl)}`, request.url))
      }
      
      userId = session.user.id
    }

    // Intercambiar código por credenciales
    const credentials = await exchangeCodeForCredentials(code)
    
    // Guardar las credenciales en la base de datos
    await prisma.user.update({
      where: { id: userId },
      data: {
        // @ts-ignore - Los campos existen en el schema pero TypeScript no los reconoce aún
        marketplaceAccessToken: credentials.access_token,
        marketplaceRefreshToken: credentials.refresh_token,
        marketplaceUserId: credentials.user_id?.toString(),
        marketplaceConnectedAt: new Date(),
      }
    })

    // Redirigir al usuario de vuelta a settings con éxito
    return NextResponse.redirect(new URL('/dashboard/settings?success=connected', request.url))
    
  } catch (error) {
    console.error('Error connecting to MercadoPago:', error)
    return NextResponse.redirect(new URL('/dashboard/settings?error=connection_failed', request.url))
  } finally {
    await prisma.$disconnect()
  }
}
