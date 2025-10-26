"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, CheckCircle, AlertTriangle, ArrowLeft, RotateCcw, Play, Square, Shield } from "lucide-react"
import { CameraService } from "@/lib/services/camera.service"
import { LivenessService } from "@/lib/services/liveness.service"
import { FaceMatchingService } from "@/lib/services/face-matching.service"
import { VerificationService } from "@/lib/services/verification.service"
import { DNIService } from "@/lib/services/dni.service"

type VerificationStep = "intro" | "camera-check" | "liveness" | "dni-front" | "dni-back" | "processing" | "complete" | "error"

interface IdentityVerificationFormProps {
  onComplete?: (data: any) => void
  onBack?: () => void
}

export default function IdentityVerificationForm({ onComplete, onBack }: IdentityVerificationFormProps) {
  const [step, setStep] = useState<VerificationStep>("intro")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Servicios
  const cameraService = CameraService.getInstance()
  const livenessService = LivenessService.getInstance()
  const faceMatchingService = FaceMatchingService.getInstance()
  const verificationService = VerificationService.getInstance()
  const dniService = DNIService.getInstance()

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estado de verificación
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [livenessCompleted, setLivenessCompleted] = useState(false)
  const [dniFrontImage, setDniFrontImage] = useState<string | null>(null)
  const [dniBackData, setDniBackData] = useState<any>(null)
  const [extractedFaceImage, setExtractedFaceImage] = useState<string | null>(null)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  // Estado de liveness
  const [isRecordingLiveness, setIsRecordingLiveness] = useState(false)
  const [livenessProgress, setLivenessProgress] = useState(0)

  console.log('📋 [IDENTITY-VERIFICATION] Estado actual:', {
    step,
    hasStream: !!stream,
    livenessCompleted,
    hasDniFront: !!dniFrontImage,
    hasDniBack: !!dniBackData,
    hasExtractedFace: !!extractedFaceImage
  })

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (stream) {
        cameraService.stopStream(stream)
      }
    }
  }, [stream, cameraService])

  // Verificar acceso a cámara
  const handleCameraCheck = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('📹 [IDENTITY-VERIFICATION] Verificando acceso a cámara...')

      const capabilities = await cameraService.getCameraCapabilities()
      console.log('📊 [IDENTITY-VERIFICATION] Capacidades de cámara:', capabilities)

      if (!capabilities.hasFrontCamera && !capabilities.hasBackCamera) {
        throw new Error('No se detectaron cámaras disponibles en este dispositivo')
      }

      const cameraStream = await cameraService.requestCameraAccess()
      setStream(cameraStream)

      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream
        await videoRef.current.play()
      }

      setStep("liveness")
      console.log('✅ [IDENTITY-VERIFICATION] Cámara verificada correctamente')

    } catch (err) {
      console.error('❌ [IDENTITY-VERIFICATION] Error en verificación de cámara:', err)
      setError(err instanceof Error ? err.message : 'Error accediendo a la cámara')
    } finally {
      setIsLoading(false)
    }
  }, [cameraService])

  // Iniciar detección de liveness
  const handleStartLiveness = useCallback(async () => {
    if (!videoRef.current || !stream) return

    setIsRecordingLiveness(true)
    setLivenessProgress(0)
    setError(null)

    try {
      console.log('🎭 [IDENTITY-VERIFICATION] Iniciando detección de liveness...')

      // Simular progreso
      const progressInterval = setInterval(() => {
        setLivenessProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const livenessResult = await livenessService.detectHeadMovement(videoRef.current, {
        movementThreshold: 15,
        duration: 2,
        requiredDirection: 'both'
      })

      clearInterval(progressInterval)
      setLivenessProgress(100)

      if (livenessResult.isLive) {
        setLivenessCompleted(true)
        console.log('✅ [IDENTITY-VERIFICATION] Liveness completado exitosamente')

        // Capturar frame del video para comparación facial
        if (canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')!
          canvas.width = videoRef.current.videoWidth
          canvas.height = videoRef.current.videoHeight
          ctx.drawImage(videoRef.current, 0, 0)

          const liveFaceImage = canvas.toDataURL('image/jpeg', 0.9)
          // Guardar para comparación posterior
          localStorage.setItem('liveFaceImage', liveFaceImage)
        }

        setStep("dni-front")
      } else {
        throw new Error(livenessResult.error || 'No se detectó movimiento de cabeza válido')
      }

    } catch (err) {
      console.error('❌ [IDENTITY-VERIFICATION] Error en liveness:', err)
      setError(err instanceof Error ? err.message : 'Error en detección de liveness')
    } finally {
      setIsRecordingLiveness(false)
    }
  }, [livenessService])

  // Capturar frente del DNI
  const handleCaptureDNIFront = useCallback(async () => {
    if (!fileInputRef.current) return

    fileInputRef.current.click()
  }, [])

  // Procesar imagen del frente del DNI
  const handleDNIFrontFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      console.log('🖼️ [IDENTITY-VERIFICATION] Procesando frente del DNI...')

      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageData = e.target?.result as string
        setDniFrontImage(imageData)

        // Procesar imagen para extraer la cara
        const result = await verificationService.processDNIFrontImage(imageData)

        if (result.error) {
          throw new Error(result.error)
        }

        if (result.faceImage) {
          setExtractedFaceImage(result.faceImage)
          console.log('✅ [IDENTITY-VERIFICATION] Cara extraída del frente del DNI')
          setStep("dni-back")
        }
      }

      reader.readAsDataURL(file)

    } catch (err) {
      console.error('❌ [IDENTITY-VERIFICATION] Error procesando frente del DNI:', err)
      setError(err instanceof Error ? err.message : 'Error procesando imagen del frente del DNI')
    } finally {
      setIsLoading(false)
    }
  }, [verificationService])

  // Capturar dorso del DNI (simulado - en producción usaría escáner PDF417)
  const handleCaptureDNIBack = useCallback(async () => {
    // Simular datos PDF417 para testing
    const mockPDF417Data = {
      documentNumber: "12345678",
      firstName: "Juan",
      lastName: "Pérez",
      birthDate: "1990-01-01",
      gender: "M",
      expirationDate: "2030-01-01"
    }

    setDniBackData(mockPDF417Data)
    setStep("processing")

    // Iniciar procesamiento final
    await handleFinalProcessing(mockPDF417Data)
  }, [])

  // Procesamiento final
  const handleFinalProcessing = useCallback(async (pdf417Data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 [IDENTITY-VERIFICATION] Iniciando procesamiento final...')

      // Obtener imagen del rostro del video
      const liveFaceImage = localStorage.getItem('liveFaceImage')
      if (!liveFaceImage || !extractedFaceImage) {
        throw new Error('Faltan imágenes para comparación facial')
      }

      // Comparar rostros
      const matchResult = await verificationService.compareLiveFaceWithDNI(liveFaceImage, extractedFaceImage)

      if (!matchResult.isMatch) {
        throw new Error('La comparación facial no fue exitosa. Intente nuevamente.')
      }

      // Procesar datos del DNI
      const dniData = await verificationService.processDNIBackData(pdf417Data)

      // Resultado final
      const result = {
        success: true,
        dniData,
        faceMatchScore: matchResult.score,
        verificationId: `ver_${Date.now()}`
      }

      setVerificationResult(result)
      setStep("complete")

      console.log('✅ [IDENTITY-VERIFICATION] Verificación completada exitosamente:', result)

      if (onComplete) {
        onComplete(result)
      }

    } catch (err) {
      console.error('❌ [IDENTITY-VERIFICATION] Error en procesamiento final:', err)
      setError(err instanceof Error ? err.message : 'Error en procesamiento final')
      setStep("error")
    } finally {
      setIsLoading(false)
    }
  }, [verificationService, extractedFaceImage, onComplete])

  // Reset completo
  const handleReset = useCallback(() => {
    if (stream) {
      cameraService.stopStream(stream)
    }

    setStep("intro")
    setError(null)
    setStream(null)
    setLivenessCompleted(false)
    setDniFrontImage(null)
    setDniBackData(null)
    setExtractedFaceImage(null)
    setVerificationResult(null)
    setIsRecordingLiveness(false)
    setLivenessProgress(0)

    localStorage.removeItem('liveFaceImage')
    verificationService.reset()

    console.log('🔄 [IDENTITY-VERIFICATION] Estado reseteado')
  }, [stream, cameraService, verificationService])

  // Renderizado condicional por paso
  const renderStep = () => {
    switch (step) {
      case "intro":
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verificación de Identidad
              </h2>
              <p className="text-gray-600 mb-6">
                Verificaremos tu identidad mediante reconocimiento facial y documento de identidad
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <span className="text-gray-700">Verificación de movimiento (liveness)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <span className="text-gray-700">Foto del frente del DNI</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <span className="text-gray-700">Foto del dorso del DNI</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <span className="text-gray-700">Comparación facial</span>
              </div>
            </div>

            <button
              onClick={handleCameraCheck}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verificando...' : 'Comenzar Verificación'}
            </button>
          </div>
        )

      case "camera-check":
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verificando Cámara
              </h2>
              <p className="text-gray-600">
                Estamos verificando el acceso a tu cámara...
              </p>
            </div>
          </div>
        )

      case "liveness":
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Play className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verificación de Liveness
              </h2>
              <p className="text-gray-600 mb-4">
                Gira tu cabeza lentamente hacia la izquierda y derecha para verificar que eres una persona real
              </p>
            </div>

            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-200"
              />
              <canvas ref={canvasRef} className="hidden" />

              {isRecordingLiveness && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-medium">Analizando movimiento...</p>
                    <p className="text-sm opacity-80">{livenessProgress}%</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleStartLiveness}
                disabled={isRecordingLiveness}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRecordingLiveness ? 'Analizando...' : 'Iniciar Verificación'}
              </button>

              <button
                onClick={handleReset}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        )

      case "dni-front":
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🆔</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Foto del Frente del DNI
              </h2>
              <p className="text-gray-600 mb-4">
                Toma una foto clara del frente de tu DNI donde se vea tu foto
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleDNIFrontFile}
              className="hidden"
            />

            <div className="space-y-3">
              <button
                onClick={handleCaptureDNIFront}
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Procesando...' : 'Tomar Foto del DNI'}
              </button>

              <button
                onClick={handleReset}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        )

      case "dni-back":
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">📄</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Foto del Dorso del DNI
              </h2>
              <p className="text-gray-600 mb-4">
                Toma una foto del dorso de tu DNI para leer los datos
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCaptureDNIBack}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700"
              >
                Tomar Foto del Dorso
              </button>

              <button
                onClick={handleReset}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        )

      case "processing":
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Procesando Verificación
              </h2>
              <p className="text-gray-600">
                Estamos comparando tu rostro con la foto del DNI...
              </p>
            </div>
          </div>
        )

      case "complete":
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Verificación Exitosa!
              </h2>
              <p className="text-gray-600 mb-4">
                Tu identidad ha sido verificada correctamente
              </p>
            </div>

            {verificationResult && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h3 className="font-medium text-gray-900 mb-2">Datos Verificados:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>DNI:</strong> {verificationResult.dniData?.documentNumber}</p>
                  <p><strong>Nombre:</strong> {verificationResult.dniData?.fullName}</p>
                  <p><strong>Fecha de Nacimiento:</strong> {verificationResult.dniData?.birthDate}</p>
                  <p><strong>Similitud Facial:</strong> {(verificationResult.faceMatchScore * 100).toFixed(1)}%</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleReset}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700"
              >
                Verificar Otra Persona
              </button>

              {onBack && (
                <button
                  onClick={onBack}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  Volver
                </button>
              )}
            </div>
          </div>
        )

      case "error":
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Error en Verificación
              </h2>
              <p className="text-gray-600 mb-4">
                {error || 'Ha ocurrido un error durante la verificación'}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleReset}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
              >
                Intentar de Nuevo
              </button>

              {onBack && (
                <button
                  onClick={onBack}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  Volver
                </button>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        {onBack && step !== "intro" && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500">
              Paso {getStepNumber(step)} de 5
            </span>
            <span className="text-sm font-medium text-gray-500">
              {getStepName(step)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(getStepNumber(step) / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Contenido del paso actual */}
      {renderStep()}

      {/* Error global */}
      {error && step !== "error" && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

// Funciones auxiliares
function getStepNumber(step: VerificationStep): number {
  const steps = {
    "intro": 0,
    "camera-check": 1,
    "liveness": 1,
    "dni-front": 2,
    "dni-back": 3,
    "processing": 4,
    "complete": 5,
    "error": 0
  }
  return steps[step] || 0
}

function getStepName(step: VerificationStep): string {
  const names = {
    "intro": "Inicio",
    "camera-check": "Cámara",
    "liveness": "Liveness",
    "dni-front": "Frente DNI",
    "dni-back": "Dorso DNI",
    "processing": "Procesando",
    "complete": "Completado",
    "error": "Error"
  }
  return names[step] || ""
}
