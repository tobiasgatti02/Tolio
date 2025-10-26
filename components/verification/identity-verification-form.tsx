"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, CheckCircle, AlertTriangle, ArrowLeft, RotateCcw, Play, Square, Shield } from "lucide-react"
import * as faceapi from 'face-api.js'
import { CameraService, CameraDevice } from "@/lib/services/camera.service"
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

  // Estado de cámaras
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)

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

  // Actualizar video cuando cambie el stream
  useEffect(() => {
    if (videoRef.current && stream) {
      console.log('📹 [IDENTITY-VERIFICATION] Asignando stream al video element')
      videoRef.current.srcObject = stream
      videoRef.current.play().then(() => {
        console.log('✅ [IDENTITY-VERIFICATION] Video playing successfully')
      }).catch((error) => {
        console.error('❌ [IDENTITY-VERIFICATION] Error playing video:', error)
      })
    } else {
      console.log('⚠️ [IDENTITY-VERIFICATION] No se puede asignar stream:', {
        hasVideoRef: !!videoRef.current,
        hasStream: !!stream
      })
    }
  }, [stream])

  // Cargar cámaras disponibles al montar
  useEffect(() => {
    const loadCameras = async () => {
      try {
        // En móviles, necesitamos solicitar permiso primero para obtener las etiquetas correctas
        if (cameraService.isMobileDevice()) {
          try {
            // Solicitar permiso temporal para poblar las etiquetas
            const tempStream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'user' },
              audio: false
            })
            // Liberar el stream inmediatamente
            tempStream.getTracks().forEach(track => track.stop())

            // Esperar un poco para que las etiquetas se actualicen
            await new Promise(resolve => setTimeout(resolve, 100))
          } catch (error) {
            console.warn('⚠️ [IDENTITY-VERIFICATION] No se pudo obtener permiso temporal para etiquetas')
          }
        }

        const cameras = await cameraService.getAvailableCameras()
        setAvailableCameras(cameras)

        // Si estamos en móvil y solo hay una cámara, seleccionarla automáticamente
        if (cameraService.isMobileDevice() && cameras.length === 1) {
          setSelectedCameraId(cameras[0].deviceId)
        }

        console.log('📹 [IDENTITY-VERIFICATION] Cámaras disponibles:', cameras)
      } catch (error) {
        console.error('❌ [IDENTITY-VERIFICATION] Error cargando cámaras:', error)
      }
    }

    loadCameras()
  }, [cameraService])

  // Refrescar lista de cámaras
  const refreshCameras = useCallback(async () => {
    try {
      console.log('🔄 [IDENTITY-VERIFICATION] Refrescando cámaras...')
      const cameras = await cameraService.getAvailableCameras()
      setAvailableCameras(cameras)
      console.log('📹 [IDENTITY-VERIFICATION] Cámaras refrescadas:', cameras)
    } catch (error) {
      console.error('❌ [IDENTITY-VERIFICATION] Error refrescando cámaras:', error)
    }
  }, [cameraService])

  // Cambiar de cámara
  const handleCameraChange = useCallback(async (deviceId: string) => {
    if (!deviceId) return

    try {
      // Detener stream actual
      if (stream) {
        cameraService.stopStream(stream)
      }

      // Solicitar nuevo stream
      const newStream = await cameraService.requestCameraAccessById(deviceId)
      setStream(newStream)
      setSelectedCameraId(deviceId)

      console.log('✅ [IDENTITY-VERIFICATION] Cámara cambiada exitosamente')
    } catch (error) {
      console.error('❌ [IDENTITY-VERIFICATION] Error cambiando cámara:', error)
      setError('Error cambiando de cámara')
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

      // Si no hay cámara seleccionada, usar la recomendada
      let cameraStream: MediaStream
      if (selectedCameraId) {
        cameraStream = await cameraService.requestCameraAccessById(selectedCameraId)
      } else {
        cameraStream = await cameraService.requestCameraAccess()
      }

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
  }, [cameraService, selectedCameraId])

  // Iniciar detección de liveness
  const handleStartLiveness = useCallback(async () => {
    console.log('🎭 [IDENTITY-VERIFICATION] handleStartLiveness llamado')
    console.log('📊 [IDENTITY-VERIFICATION] Estado actual:', {
      hasVideoRef: !!videoRef.current,
      hasStream: !!stream,
      videoReadyState: videoRef.current?.readyState,
      videoSrcObject: !!videoRef.current?.srcObject,
      step
    })

    if (!videoRef.current) {
      console.error('❌ [IDENTITY-VERIFICATION] No hay videoRef')
      setError('Error: Elemento de video no encontrado')
      return
    }

    if (!stream) {
      console.error('❌ [IDENTITY-VERIFICATION] No hay stream')
      setError('Error: Stream de cámara no disponible')
      return
    }

    // Verificar que el video tenga el stream asignado
    if (!videoRef.current.srcObject) {
      console.log('🔄 [IDENTITY-VERIFICATION] Asignando stream al video...')
      videoRef.current.srcObject = stream
      await videoRef.current.play()
    }

    setIsRecordingLiveness(true)
    setLivenessProgress(0)
    setError(null)

    try {
      console.log('🎭 [IDENTITY-VERIFICATION] Iniciando detección de liveness real...')

      // Cargar modelos de face-api.js si no están cargados
      if (!faceapi.nets.tinyFaceDetector.isLoaded || !faceapi.nets.faceLandmark68Net.isLoaded) {
        console.log('🔄 [IDENTITY-VERIFICATION] Cargando modelos de face-api.js...')
        setLivenessProgress(10)

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights/'),
          faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights/')
        ])

        console.log('✅ [IDENTITY-VERIFICATION] Modelos cargados exitosamente')
        setLivenessProgress(20)
      }

      // Variables para tracking de movimiento
      let movementDetected = false
      let leftTurnDetected = false
      let rightTurnDetected = false
      let centerPositionDetected = false
      let lastYawAngle = 0
      let movementStartTime = Date.now()
      const maxDuration = 15000 // 15 segundos máximo
      const requiredMovements = ['center', 'left', 'right']

      // Función para calcular ángulo yaw desde landmarks
      const calculateYawAngle = (landmarks: faceapi.FaceLandmarks68) => {
        const nose = landmarks.getNose()
        const leftEye = landmarks.getLeftEye()
        const rightEye = landmarks.getRightEye()

        // Calcular ángulo basado en la posición relativa de los ojos y nariz
        const eyeCenterX = (leftEye[0].x + rightEye[0].x) / 2
        const noseX = nose[0].x

        // Ángulo yaw aproximado (positivo = mirando a la derecha, negativo = izquierda)
        const yawAngle = (noseX - eyeCenterX) / (rightEye[0].x - leftEye[0].x) * 30 // Escalar para grados
        return yawAngle
      }

      // Función para detectar movimiento de cabeza
      const detectHeadMovement = async () => {
        if (!videoRef.current) return false

        try {
          const detection = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 })
          ).withFaceLandmarks()

          if (!detection) {
            console.log('⚠️ [IDENTITY-VERIFICATION] No se detectó cara')
            return false
          }

          const currentYawAngle = calculateYawAngle(detection.landmarks)
          console.log('📊 [IDENTITY-VERIFICATION] Ángulo yaw detectado:', currentYawAngle)

          // Detectar posiciones
          const isCenter = Math.abs(currentYawAngle) < 5
          const isLeft = currentYawAngle < -10
          const isRight = currentYawAngle > 10

          // Actualizar estado de movimientos detectados
          if (isCenter && !centerPositionDetected) {
            centerPositionDetected = true
            console.log('✅ [IDENTITY-VERIFICATION] Posición central detectada')
          }
          if (isLeft && !leftTurnDetected) {
            leftTurnDetected = true
            console.log('✅ [IDENTITY-VERIFICATION] Giro a la izquierda detectado')
          }
          if (isRight && !rightTurnDetected) {
            rightTurnDetected = true
            console.log('✅ [IDENTITY-VERIFICATION] Giro a la derecha detectado')
          }

          // Calcular progreso basado en movimientos completados
          const completedMovements = [centerPositionDetected, leftTurnDetected, rightTurnDetected].filter(Boolean).length
          const progress = Math.min(20 + (completedMovements / requiredMovements.length) * 70, 90)
          setLivenessProgress(progress)

          // Verificar si se completaron todos los movimientos requeridos
          movementDetected = centerPositionDetected && leftTurnDetected && rightTurnDetected

          return movementDetected

        } catch (err) {
          console.error('❌ [IDENTITY-VERIFICATION] Error en detección facial:', err)
          return false
        }
      }

      // Loop de detección
      const detectionInterval = setInterval(async () => {
        const elapsed = Date.now() - movementStartTime

        // Timeout
        if (elapsed > maxDuration) {
          clearInterval(detectionInterval)
          setError('Tiempo agotado. Por favor, intenta de nuevo moviendo la cabeza más claramente.')
          setIsRecordingLiveness(false)
          return
        }

        // Detectar movimiento
        const movementCompleted = await detectHeadMovement()

        if (movementCompleted) {
          clearInterval(detectionInterval)
          setLivenessProgress(100)

          // Resultado exitoso
          setLivenessCompleted(true)
          console.log('✅ [IDENTITY-VERIFICATION] Liveness completado exitosamente con movimiento real')

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
            console.log('📸 [IDENTITY-VERIFICATION] Frame capturado del video')
          }

          setStep("dni-front")
          setIsRecordingLiveness(false)
        }
      }, 200) // Detectar cada 200ms

    } catch (err) {
      console.error('❌ [IDENTITY-VERIFICATION] Error en liveness:', err)
      setError(err instanceof Error ? err.message : 'Error en detección de liveness')
      setIsRecordingLiveness(false)
    }
  }, [stream])

  // Capturar frente del DNI
  const handleCaptureDNIFront = useCallback(async () => {
    console.log('📸 [IDENTITY-VERIFICATION] handleCaptureDNIFront llamado')
    console.log('📸 [IDENTITY-VERIFICATION] fileInputRef existe:', !!fileInputRef.current)

    if (!fileInputRef.current) {
      console.error('❌ [IDENTITY-VERIFICATION] fileInputRef no existe')
      setError('Error: Elemento de input no encontrado')
      return
    }

    console.log('📸 [IDENTITY-VERIFICATION] Haciendo click en input file...')
    fileInputRef.current.click()
  }, [])

  // Procesar imagen del frente del DNI
  const handleDNIFrontFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 [IDENTITY-VERIFICATION] handleDNIFrontFile llamado')
    console.log('📁 [IDENTITY-VERIFICATION] Event target:', event.target)
    console.log('📁 [IDENTITY-VERIFICATION] Files:', event.target.files)

    const file = event.target.files?.[0]
    if (!file) {
      console.log('⚠️ [IDENTITY-VERIFICATION] No se seleccionó ningún archivo')
      return
    }

    console.log('📁 [IDENTITY-VERIFICATION] Archivo seleccionado:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    })

    setIsLoading(true)
    setError(null)

    try {
      console.log('🖼️ [IDENTITY-VERIFICATION] Procesando frente del DNI...')

      const reader = new FileReader()
      reader.onload = async (e) => {
        console.log('📖 [IDENTITY-VERIFICATION] FileReader onload triggered')
        const imageData = e.target?.result as string
        console.log('🖼️ [IDENTITY-VERIFICATION] Imagen cargada, tamaño:', imageData.length, 'caracteres')

        setDniFrontImage(imageData)
        console.log('🖼️ [IDENTITY-VERIFICATION] Imagen asignada al estado')

        // Procesar imagen para extraer la cara
        console.log('🔄 [IDENTITY-VERIFICATION] Llamando a verificationService.processDNIFrontImage...')
        const result = await verificationService.processDNIFrontImage(imageData)
        console.log('📋 [IDENTITY-VERIFICATION] Resultado del procesamiento:', result)

        if (result.error) {
          console.error('❌ [IDENTITY-VERIFICATION] Error en procesamiento:', result.error)
          throw new Error(result.error)
        }

        if (result.faceImage) {
          setExtractedFaceImage(result.faceImage)
          console.log('✅ [IDENTITY-VERIFICATION] Cara extraída del frente del DNI')
          console.log('🔄 [IDENTITY-VERIFICATION] Cambiando paso a dni-back...')
          setStep("dni-back")
          console.log('✅ [IDENTITY-VERIFICATION] Paso cambiado exitosamente')
        } else {
          console.error('❌ [IDENTITY-VERIFICATION] No se pudo extraer la cara')
          throw new Error('No se pudo extraer la cara de la imagen')
        }
      }

      reader.onerror = (error) => {
        console.error('❌ [IDENTITY-VERIFICATION] Error en FileReader:', error)
        setError('Error al leer la imagen')
        setIsLoading(false)
      }

      console.log('📖 [IDENTITY-VERIFICATION] Iniciando FileReader.readAsDataURL...')
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
              onClick={() => setStep("camera-check")}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
            >
              Comenzar Verificación
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
                Seleccionar Cámara
              </h2>
              <p className="text-gray-600 mb-4">
                Elige la cámara que deseas usar para la verificación
              </p>
            </div>

            {availableCameras.length > 0 ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cámaras disponibles ({availableCameras.length}):
                </label>
                <select
                  value={selectedCameraId || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setSelectedCameraId(value || null)
                    console.log('📹 [IDENTITY-VERIFICATION] Cámara seleccionada:', value)
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar cámara...</option>
                  {availableCameras.map((camera, index) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Cámara ${index + 1}`}
                      {camera.facingMode === 'user' ? ' (Frontal)' :
                       camera.facingMode === 'environment' ? ' (Trasera)' :
                       ' (Desconocida)'}
                    </option>
                  ))}
                </select>
                {selectedCameraId && (
                  <p className="text-sm text-green-600">
                    ✓ Cámara seleccionada: {availableCameras.find(c => c.deviceId === selectedCameraId)?.label || 'Cámara seleccionada'}
                  </p>
                )}
                <button
                  onClick={refreshCameras}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                  type="button"
                >
                  🔄 Refrescar cámaras
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Cargando cámaras disponibles...</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => {
                  console.log('🔘 [IDENTITY-VERIFICATION] Botón clickeado:', {
                    isLoading,
                    availableCamerasCount: availableCameras.length,
                    selectedCameraId,
                    shouldBeDisabled: isLoading || (availableCameras.length > 0 && !selectedCameraId)
                  })
                  handleCameraCheck()
                }}
                disabled={isLoading || (availableCameras.length > 0 && !selectedCameraId)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verificando...' : 'Continuar con Verificación'}
              </button>

              <button
                onClick={() => setStep("intro")}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
              >
                Volver
              </button>
            </div>
          </div>
        )

      case "liveness":
        console.log('🎭 [IDENTITY-VERIFICATION] Renderizando paso liveness')
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

              {availableCameras.length > 1 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cambiar cámara:
                  </label>
                  <select
                    value={selectedCameraId || ''}
                    onChange={(e) => handleCameraChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    disabled={isRecordingLiveness}
                  >
                    {availableCameras.map((camera) => (
                      <option key={camera.deviceId} value={camera.deviceId}>
                        {camera.label} ({camera.facingMode === 'user' ? 'Frontal' : 'Trasera'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
                onClick={() => {
                  console.log('🎭 [IDENTITY-VERIFICATION] Botón "Iniciar Verificación" clickeado')
                  handleStartLiveness()
                }}
                disabled={isRecordingLiveness}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRecordingLiveness ? 'Analizando...' : 'Iniciar Verificación'}
              </button>

              <button
                onClick={() => {
                  console.log('🔍 [DEBUG] Estado del video:', {
                    hasVideoRef: !!videoRef.current,
                    hasStream: !!stream,
                    videoReadyState: videoRef.current?.readyState,
                    videoSrcObject: !!videoRef.current?.srcObject,
                    videoWidth: videoRef.current?.videoWidth,
                    videoHeight: videoRef.current?.videoHeight
                  })
                }}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 text-sm"
              >
                🔍 Debug Video
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
