import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import prisma from "@/lib/prisma"



export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        hasAccount: false,
        isComplete: false 
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeAccountId: true }
    })

    const hasAccount = !!user?.stripeAccountId
    let isComplete = false

    if (hasAccount && user.stripeAccountId) {
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
        const account = await stripe.accounts.retrieve(user.stripeAccountId)
        isComplete = account.charges_enabled && account.payouts_enabled
      } catch (error) {
        console.error('Error checking Stripe account:', error)
      }
    }

    return NextResponse.json({
      hasAccount,
      isComplete,
      stripeAccountId: user?.stripeAccountId || null
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      hasAccount: false,
      isComplete: false,
      error: 'Error al verificar cuenta' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
