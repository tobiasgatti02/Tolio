"use client"

import { useState, useEffect } from 'react'

interface VerificationStatus {
  verifiedIdentity: boolean
  hasVerification: boolean
  verificationStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | null
  loading: boolean
  error: string | null
}

export function useVerificationStatus(userId?: string) {
  const [status, setStatus] = useState<VerificationStatus>({
    verifiedIdentity: false,
    hasVerification: false,
    verificationStatus: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    async function fetchVerificationStatus() {
      if (!userId) {
        setStatus(prev => ({ ...prev, loading: false }))
        return
      }

      try {
        console.log('🔍 [USE-VERIFICATION-STATUS] Obteniendo estado de verificación para:', userId)
        
        const response = await fetch(`/api/verification/status?userId=${userId}`)
        const data = await response.json()

        console.log('📨 [USE-VERIFICATION-STATUS] Estado recibido:', data)

        if (response.ok) {
          setStatus({
            verifiedIdentity: data.verifiedIdentity || false,
            hasVerification: data.hasVerification || false,
            verificationStatus: data.status || null,
            loading: false,
            error: null
          })
        } else {
          throw new Error(data.error || 'Error al obtener estado de verificación')
        }
      } catch (error) {
        console.error('❌ [USE-VERIFICATION-STATUS] Error:', error)
        setStatus(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }))
      }
    }

    fetchVerificationStatus()
  }, [userId])

  return status
}
