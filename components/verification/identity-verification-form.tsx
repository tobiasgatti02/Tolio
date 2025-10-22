"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle, AlertTriangle, Shield } from "lucide-react"
import DniPDF417Capture from "./dni-pdf417-capture"
import SelfieCapture from "./selfie-capture"

type VerificationStep = "intro" | "dni" | "selfie" | "processing" | "complete" | "error"

interface PDF417Data {
  documentNumber: string
  firstName: string
  lastName: string
  birthDate: string
  gender: string
  expirationDate: string
  rawData: string
}

export default function IdentityVerificationForm() {
  const router = useRouter()
  const [step, setStep] = useState<VerificationStep>("intro")
  const [dniImage, setDniImage] = useState<string | null>(null)
  const [pdf417Data, setPdf417Data] = useState<PDF417Data | null>(null)
  const [selfieImage, setSelfieImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  console.log('📋 [IDENTITY-VERIFICATION-FORM] Estado actual:', {
    step,
    hasDni: !!dniImage,
    hasPdf417: !!pdf417Data,
    hasSelfie: !!selfieImage
  })

  const handleDniCapture = (imageData: string, data: PDF417Data) => {
    console.log('✅ [IDENTITY-VERIFICATION-FORM] DNI capturado')
    console.log('📊 [IDENTITY-VERIFICATION-FORM] Datos PDF417:', data)
    setDniImage(imageData)
    setPdf417Data(data)
    setStep("selfie")
  }

  const handleSelfieCapture = async (imageData: string) => {
    console.log('✅ [IDENTITY-VERIFICATION-FORM] Selfie capturada')
    setSelfieImage(imageData)
    setStep("processing")

    console.log('📤 [IDENTITY-VERIFICATION-FORM] Enviando datos al servidor...')

    try {
      // Convertir base64 a File
      const dniFile = dataURLtoFile(dniImage!, 'dni.jpg')
      const selfieFile = dataURLtoFile(imageData, 'selfie.jpg')

      console.log('📦 [IDENTITY-VERIFICATION-FORM] Archivos preparados:', {
        dniSize: dniFile.size,
        selfieSize: selfieFile.size
      })

      const formData = new FormData()
      formData.append('dniFront', dniFile)
      formData.append('selfie', selfieFile)
      formData.append('pdf417Data', JSON.stringify(pdf417Data))

      console.log('🚀 [IDENTITY-VERIFICATION-FORM] Enviando POST a /api/verification/identity')

      const response = await fetch('/api/verification/identity', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      console.log('📨 [IDENTITY-VERIFICATION-FORM] Respuesta del servidor:', result)

      if (response.ok) {
        console.log('✅ [IDENTITY-VERIFICATION-FORM] Verificación exitosa')
        setVerificationResult(result)
        setStep("complete")
      } else {
        console.error('❌ [IDENTITY-VERIFICATION-FORM] Error en la verificación:', result.error)
        setError(result.error || 'Error en la verificación')
        setStep("error")
      }
    } catch (error) {
      console.error('❌ [IDENTITY-VERIFICATION-FORM] Error en el proceso:', error)
      setError('Error al procesar la verificación. Intenta de nuevo.')
      setStep("error")
    }
  }

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)![1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  const handleRetry = () => {
    console.log('🔄 [IDENTITY-VERIFICATION-FORM] Reiniciando verificación')
    setDniImage(null)
    setPdf417Data(null)
    setSelfieImage(null)
    setError(null)
    setVerificationResult(null)
    setStep("intro")
  }

  const handleComplete = () => {
    console.log('🎉 [IDENTITY-VERIFICATION-FORM] Proceso completado, redirigiendo...')
    router.push("/dashboard")
  }

  const renderStep = () => {
    switch (step) {
      case "intro":
        return (
          <div className="text-center">
            <div className="bg-emerald-100 p-4 rounded-full inline-flex items-center justify-center mb-6">
              <Shield className="h-12 w-12 text-emerald-600" />
            </div>

            <h1 className="text-2xl font-bold mb-4">Verificación de Identidad</h1>

            <p className="text-gray-600 mb-6">
              Vamos a verificar tu identidad usando tu DNI argentino y una selfie.
              Este proceso es rápido y seguro.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium mb-2">Qué necesitarás:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Tu DNI argentino (el dorso con el código PDF417)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Buena iluminación para tomar las fotos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Unos minutos de tu tiempo</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-blue-900 mb-2">🔐 Privacidad y Seguridad</h3>
              <p className="text-sm text-blue-800">
                Tus datos biométricos están protegidos y encriptados.
                Solo se usan para verificar tu identidad una vez.
              </p>
            </div>

            <button
              onClick={() => setStep("dni")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium"
            >
              Comenzar verificación
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full mt-4 text-gray-600 hover:text-gray-800 py-2 font-medium"
            >
              Verificar más tarde
            </button>
          </div>
        )

      case "dni":
        return <DniPDF417Capture onCapture={handleDniCapture} onBack={() => setStep("intro")} />

      case "selfie":
        return <SelfieCapture onCapture={handleSelfieCapture} onBack={() => setStep("dni")} />

      case "processing":
        return (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Procesando verificación</h2>
            <p className="text-gray-600">
              Estamos validando tu identidad. Esto puede tomar unos momentos...
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <p>✓ Leyendo datos del DNI</p>
              <p>✓ Validando foto de identidad</p>
              <p>✓ Comparando rostros</p>
            </div>
          </div>
        )

      case "complete":
        return (
          <div className="text-center py-8">
            <div className="bg-green-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Verificación completada!</h2>
            <p className="text-gray-600 mb-6">Tu identidad ha sido verificada exitosamente.</p>

            {verificationResult && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium mb-2">Datos verificados:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Nombre:</strong> {verificationResult.documentData.fullName}</p>
                  <p><strong>DNI:</strong> {verificationResult.documentData.documentNumber}</p>
                  <p><strong>Confianza:</strong> {(verificationResult.faceMatchScore * 100).toFixed(1)}%</p>
                </div>
              </div>
            )}

            <button
              onClick={handleComplete}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium"
            >
              Ir al Dashboard
            </button>
          </div>
        )

      case "error":
        return (
          <div className="text-center py-8">
            <div className="bg-red-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Error en la verificación</h2>
            <p className="text-gray-600 mb-6">{error}</p>

            <button
              onClick={handleRetry}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium mb-3"
            >
              Intentar de nuevo
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full text-gray-600 hover:text-gray-800 py-2 font-medium"
            >
              Verificar más tarde
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
      {renderStep()}
    </div>
  )
}
