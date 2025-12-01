'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Wallet } from 'lucide-react'
import Link from 'next/link'

export default function StripeAccountCheck() {
  const { data: session } = useSession()
  const [hasStripeAccount, setHasStripeAccount] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStripeAccount = async () => {
      try {
        const response = await fetch('/api/stripe/check-account')
        const data = await response.json()
        setHasStripeAccount(data.hasAccount && data.isComplete)
      } catch (error) {
        console.error('Error checking Stripe account:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      checkStripeAccount()
    }
  }, [session])

  if (loading || hasStripeAccount === null || hasStripeAccount) {
    return null
  }

  return (
    {/** 
    <Card className="border-yellow-300 bg-yellow-50 mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-1">
              ⚠️ Configura tu cuenta de pagos
            </h3>
            <p className="text-sm text-yellow-800 mb-3">
              Para poder alquilar tus artículos y recibir pagos, necesitas configurar tu cuenta de Stripe. Solo toma 5 minutos.
            </p>
            <Button 
              asChild
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Link href="/stripe-setup">
                <Wallet className="h-4 w-4 mr-2" />
                Configurar ahora
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    **/}
  )
}
