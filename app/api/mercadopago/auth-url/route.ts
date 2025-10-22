import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { getAuthorizationUrl } from "@/lib/mercadopago"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = await getAuthorizationUrl()
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error getting MercadoPago auth URL:', error)
    return NextResponse.json(
      { error: 'Error al obtener URL de autorización' },
      { status: 500 }
    )
  }
}
