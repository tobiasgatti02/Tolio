"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Shield, CheckCircle, AlertCircle, Clock, ArrowRight } from "lucide-react"
import { useSession } from "next-auth/react"

interface VerificationStatusData {
  verifiedIdentity: boolean
  hasVerification: boolean
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | null
  loading: boolean
}

export default function VerificationStatusCard() {
  const router = useRouter()
  const { data: session } = useSession()
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatusData>({
    verifiedIdentity: false,
    hasVerification: false,
    status: null,
    loading: true
  })

  console.log('🔍 [VERIFICATION-STATUS-CARD] Componente montado')

  useEffect(() => {
    async function fetchStatus() {
      if (!session?.user?.id) {
        console.log('⚠️ [VERIFICATION-STATUS-CARD] No hay sesión')
        setVerificationStatus(prev => ({ ...prev, loading: false }))
        return
      }

      try {
        console.log('📤 [VERIFICATION-STATUS-CARD] Obteniendo estado de verificación...')
        const response = await fetch('/api/verification/status')
        const data = await response.json()

        console.log('📨 [VERIFICATION-STATUS-CARD] Estado recibido:', data)

        if (response.ok) {
          setVerificationStatus({
            verifiedIdentity: data.verifiedIdentity,
            hasVerification: data.hasVerification,
            status: data.status,
            loading: false
          })
        }
      } catch (error) {
        console.error('❌ [VERIFICATION-STATUS-CARD] Error:', error)
        setVerificationStatus(prev => ({ ...prev, loading: false }))
      }
    }

    fetchStatus()
  }, [session])

  if (verificationStatus.loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  // Si ya está verificado
  if (verificationStatus.verifiedIdentity || verificationStatus.status === 'APPROVED') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-100 p-3 rounded-full">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-emerald-900 mb-1">
              Identidad verificada
            </h3>
            <p className="text-sm text-emerald-700">
              Tu identidad ha sido verificada exitosamente. Los usuarios pueden confiar en ti.
            </p>
          </div>
          <Shield className="h-5 w-5 text-emerald-600" />
        </div>
      </div>
    )
  }

  // Si está pendiente
  if (verificationStatus.status === 'PENDING') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-yellow-100 p-3 rounded-full">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-1">
              Verificación en proceso
            </h3>
            <p className="text-sm text-yellow-700">
              Estamos revisando tu solicitud de verificación. Esto puede tomar hasta 24 horas.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Si fue rechazada
  if (verificationStatus.status === 'REJECTED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">
              Verificación rechazada
            </h3>
            <p className="text-sm text-red-700 mb-3">
              Tu solicitud de verificación fue rechazada. Por favor, intenta de nuevo con fotos más claras.
            </p>
            <button
              onClick={() => router.push('/verification/identity')}
              className="text-sm font-medium text-red-700 hover:text-red-800 underline"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Si no ha iniciado la verificación
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-full">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-1">
            Verifica tu identidad
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            Aumenta la confianza de otros usuarios verificando tu identidad con tu DNI y una selfie.
            Es rápido, seguro y completamente gratis.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/verification/identity')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Verificar ahora
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => console.log('Más información')}
              className="text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              Más información
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
