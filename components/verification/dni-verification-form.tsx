"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Camera, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import DniCapture from "./dni-capture"
import VerificationComplete from "./verification-complete"

type VerificationStep = "intro" | "front" | "back" | "processing" | "complete" | "error"

export default function DniVerificationForm() {
  const router = useRouter()
  const [step, setStep] = useState<VerificationStep>("intro")
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [backImage, setBackImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFrontCapture = (imageData: string) => {
    setFrontImage(imageData)
    setStep("back")
  }

  const handleBackCapture = (imageData: string) => {
    setBackImage(imageData)
    setStep("processing")

    // Simular procesamiento de verificación
    setTimeout(() => {
      // En un caso real, aquí enviaríamos las imágenes al backend
      // para su procesamiento y verificación

      // Simulamos una verificación exitosa
      setStep("complete")

      // O en caso de error:
      // setError('No pudimos verificar tu DNI. Por favor, intenta de nuevo.')
      // setStep('error')
    }, 3000)
  }

  const handleRetry = () => {
    setFrontImage(null)
    setBackImage(null)
    setError(null)
    setStep("intro")
  }

  const handleComplete = () => {
    router.push("/dashboard")
  }

  const renderStep = () => {
    switch (step) {
      case "intro":
        return (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-6">Verificación de DNI</h1>

            <p className="text-gray-600 mb-6">
              Para verificar tu identidad, necesitamos que tomes fotos del frente y dorso de tu DNI argentino.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium mb-2">Consejos para una buena captura:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Asegúrate de que haya buena iluminación</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Coloca tu DNI sobre una superficie plana y oscura</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Asegúrate de que todo el DNI sea visible en la imagen</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Evita reflejos o sombras sobre el documento</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setStep("front")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium flex items-center justify-center"
            >
              <Camera className="h-5 w-5 mr-2" />
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

      case "front":
        return <DniCapture side="front" onCapture={handleFrontCapture} onBack={() => router.push("/dashboard")} />

      case "back":
        return <DniCapture side="back" onCapture={handleBackCapture} onBack={() => setStep("front")} />

      case "processing":
        return (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Verificando tu DNI</h2>
            <p className="text-gray-600">Estamos procesando tus imágenes. Esto puede tomar unos momentos...</p>
          </div>
        )

      case "complete":
        return <VerificationComplete onComplete={handleComplete} />

      case "error":
        return (
          <div className="text-center py-8">
            <div className="bg-red-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Error de verificación</h2>
            <p className="text-gray-600 mb-6">
              {error || "Ha ocurrido un error durante la verificación. Por favor, intenta de nuevo."}
            </p>
            <button
              onClick={handleRetry}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium"
            >
              Intentar de nuevo
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </div>

        {renderStep()}
      </div>
    </div>
  )
}

