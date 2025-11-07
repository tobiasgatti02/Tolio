import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=InvalidToken', request.url))
  }

  try {
    // Buscar usuario con este token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    })

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=TokenNotFound', request.url)
      )
    }

    // Verificar que el usuario no esté ya verificado
    if (user.isVerified) {
      return NextResponse.redirect(
        new URL('/login?message=AlreadyVerified', request.url)
      )
    }

    // Marcar usuario como verificado y limpiar el token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    })

    // Redirigir al login con mensaje de éxito
    return NextResponse.redirect(
      new URL('/login?message=EmailVerified', request.url)
    )
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.redirect(
      new URL('/login?error=VerificationFailed', request.url)
    )
  }
}
