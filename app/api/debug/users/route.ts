import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
      take: 5
    })

    return NextResponse.json({
      userCount,
      users,
      message: `Hay ${userCount} usuarios en la base de datos`
    })
  } catch (error) {
    console.error('Error checking users:', error)
    return NextResponse.json(
      { error: 'Error connecting to database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
