import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/lib/prisma"
import bcrypt from 'bcryptjs'



export async function GET(request: NextRequest) {
  try {
    // Solo funciona en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    const hashedPassword = await bcrypt.hash('123456', 10)

    // Crear usuario de prueba
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        isVerified: true,
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Usuario de prueba creado',
      user: {
        email: 'test@example.com',
        password: '123456'
      }
    })

  } catch (error) {
    console.error('Error creating test user:', error)
    return NextResponse.json({ error: 'Error creating test user' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
