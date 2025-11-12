'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Wallet, CheckCircle, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl';

export default function StripeConnectOnboarding() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const t = useTranslations('common');

  const handleConnect = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stripe/create-connected-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear cuenta de Stripe')
      }

      // Redirigir a Stripe para completar el onboarding
      if (data.accountLinkUrl) {
        window.location.href = data.accountLinkUrl
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-emerald-600" />
          {t('stripe.setup')}
        </CardTitle>
        <CardDescription>
          {t('stripe.connectDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">{t('stripe.whyNeededTitle')}</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>{t('stripe.whyNeededDesc1')}</li>
            <li>{t('stripe.whyNeededDesc2')}</li>
            <li>{t('stripe.whyNeededDesc3')}</li>
            <li>{t('stripe.whyNeededDesc4')}</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">{t('stripe.errorTitle')}</p>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{t('stripe.list.needTitle')}</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>{t('stripe.list.needItem1')}</li>
            <li>{t('stripe.list.needItem2')}</li>
            <li>{t('stripe.list.needItem3')}</li>
            <li>{t('stripe.list.needItem4')}</li>
          </ul>
        </div>

        <Button 
          onClick={handleConnect}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          size="lg">
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {t('stripe.connecting')}
            </>
          ) : (
            <>
              <Wallet className="h-5 w-5 mr-2" />
              {t('stripe.connect.button')}
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          {t('stripe.beRedirected')}
        </p>
      </CardContent>
    </Card>
  )
}
