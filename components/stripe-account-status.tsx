'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface AccountRequirements {
  accountId: string
  email: string
  enabled: {
    charges: boolean
    payouts: boolean
    details_submitted: boolean
  }
  requirements: {
    currently_due: string[]
    eventually_due: string[]
    past_due: string[]
    errors: Array<{ code: string; reason: string; requirement: string }>
  }
  needsOnboarding: boolean
  external_accounts: number
}

interface StripeAccountStatusProps {
  stripeAccountId: string | null
}

export default function StripeAccountStatus({ stripeAccountId }: StripeAccountStatusProps) {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [requirements, setRequirements] = useState<AccountRequirements | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verificar si regresó exitosamente de Stripe
  useEffect(() => {
    const stripeSuccess = searchParams.get('stripe_success')
    const stripeRefresh = searchParams.get('stripe_refresh')

    if (stripeSuccess === 'true') {
      verifyOnboarding()
    } else if (stripeRefresh === 'true') {
      setSuccessMessage('Por favor completa la información requerida por Stripe.')
      checkRequirements()
    }
  }, [searchParams])

  const verifyOnboarding = async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/stripe/verify-onboarding', {
        method: 'POST',
      })
      const data = await res.json()
      
      if (res.ok && data.isComplete) {
        setSuccessMessage('¡Cuenta configurada exitosamente! Ya puedes recibir pagos.')
        setTimeout(() => {
          router.push('/stripe-setup')
          router.refresh()
        }, 2000)
      } else {
        setSuccessMessage('Configuración pendiente. Por favor completa los datos requeridos.')
        if (stripeAccountId) {
          checkRequirements()
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setChecking(false)
    }
  }

  const checkRequirements = async () => {
    if (!stripeAccountId) return
    
    setChecking(true)
    try {
      const res = await fetch(`/api/stripe/account-requirements?accountId=${stripeAccountId}`)
      const data = await res.json()
      
      if (res.ok) {
        setRequirements(data)
      } else {
        console.error('Error checking requirements:', data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setChecking(false)
    }
  }

  const handleContinueOnboarding = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-connected-account', {
        method: 'POST',
      })
      
      const data = await res.json()
      
      if (res.ok && data.accountLinkUrl) {
        // Redirigir a Stripe para completar onboarding
        window.location.href = data.accountLinkUrl
      } else {
        console.error('Error:', data)
        alert('Error al generar link de onboarding')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al conectar con Stripe')
      setLoading(false)
    }
  }

  // Traducción de campos de Stripe
  const translateField = (field: string): string => {
    const translations: Record<string, string> = {
      'individual.id_number': 'Número de identificación (RFC)',
      'individual.verification.document': 'Documento de identidad (INE/Pasaporte)',
      'individual.address.line1': 'Dirección calle',
      'individual.address.city': 'Ciudad',
      'individual.address.postal_code': 'Código postal',
      'individual.address.state': 'Estado',
      'individual.dob.day': 'Día de nacimiento',
      'individual.dob.month': 'Mes de nacimiento',
      'individual.dob.year': 'Año de nacimiento',
      'individual.first_name': 'Nombre',
      'individual.last_name': 'Apellido',
      'individual.phone': 'Teléfono',
      'individual.email': 'Correo electrónico',
      'external_account': 'Cuenta bancaria (CLABE)',
      'tos_acceptance.date': 'Aceptación de términos',
    }
    return translations[field] || field
  }

  return (
    <div className="space-y-4">
      {/* Mensaje de éxito/info */}
      {successMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón para completar onboarding */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ExternalLink className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                Completar configuración en Stripe
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Stripe necesita verificar tu identidad y datos bancarios para habilitar transferencias. 
                Este proceso toma solo 5-10 minutos.
              </p>
              <Button 
                onClick={handleContinueOnboarding}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirigiendo...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Continuar en Stripe
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón para verificar estado */}
      {stripeAccountId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verificar Estado</CardTitle>
            <CardDescription>
              Revisa los requisitos pendientes de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={checkRequirements}
              variant="outline"
              disabled={checking}
              className="w-full"
            >
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Verificar Requisitos
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mostrar requisitos pendientes */}
      {requirements && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado de la Cuenta</CardTitle>
            <CardDescription>
              Información detallada sobre tu cuenta de Stripe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estado de habilitación */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {requirements.enabled.charges ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm">Cobros habilitados</span>
              </div>
              <div className="flex items-center gap-2">
                {requirements.enabled.payouts ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm">Pagos habilitados</span>
              </div>
            </div>

            {/* Cuenta bancaria */}
            <div className="flex items-center gap-2">
              {requirements.external_accounts > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <span className="text-sm">
                {requirements.external_accounts > 0 
                  ? `${requirements.external_accounts} cuenta(s) bancaria(s) agregada(s)` 
                  : 'Sin cuenta bancaria'}
              </span>
            </div>

            {/* Campos pendientes */}
            {requirements.requirements.currently_due.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Información requerida ahora:
                </h4>
                <ul className="space-y-1 ml-7">
                  {requirements.requirements.currently_due.map((field) => (
                    <li key={field} className="text-sm text-red-800">
                      • {translateField(field)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Errores */}
            {requirements.requirements.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-900 mb-2">Errores:</h4>
                <ul className="space-y-1 ml-4">
                  {requirements.requirements.errors.map((error, idx) => (
                    <li key={idx} className="text-sm text-red-800">
                      • {error.reason} ({translateField(error.requirement)})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Todo completo */}
            {!requirements.needsOnboarding && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-900">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">
                    ¡Todo listo! Tu cuenta está completamente configurada.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
