"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, RefreshCw, Check, ArrowLeft, User, RotateCcw, Upload } from "lucide-react"

interface SelfieCaptureProps {
  onCapture: (imageData: string) => void
  onBack: () => void
}

export default function SelfieCapture({ onCapture, onBack }: SelfieCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user") // user = frontal, environment = trasera
  const [isMobile, setIsMobile] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [useCamera, setUseCamera] = useState(true) // true = usar cámara, false = subir archivo
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  console.log('🤳 [SELFIE-CAPTURE] Componente montado, facingMode:', facingMode)

  // Detectar si es dispositivo móvil y configurar modo por defecto
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    window.innerWidth <= 768
      setIsMobile(mobile)
      // En desktop, usar subida de archivo por defecto
      setUseCamera(mobile)
      console.log('📱 [SELFIE-CAPTURE] Es móvil:', mobile, 'Usar cámara:', mobile)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const startCamera = useCallback(async (retryWithFrontal = true) => {
    console.log('📸 [SELFIE-CAPTURE] Iniciando cámara:', facingMode)
    setCameraError(null) // Limpiar errores previos
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      })
      setStream(mediaStream)
      console.log('✅ [SELFIE-CAPTURE] Cámara iniciada')

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Asegurar que el video se reproduzca
        try {
          await videoRef.current.play()
          console.log('▶️ [SELFIE-CAPTURE] Video reproduciéndose')
        } catch (playError) {
          console.error('❌ [SELFIE-CAPTURE] Error al reproducir video:', playError)
        }
      }
    } catch (error) {
      console.error('❌ [SELFIE-CAPTURE] Error al acceder a la cámara:', error)
      
      // Si falla con la cámara trasera y aún no hemos reintentado con la frontal
      if (facingMode === "environment" && retryWithFrontal) {
        console.log('🔄 [SELFIE-CAPTURE] Intentando con cámara frontal...')
        setFacingMode("user")
        return // El useEffect se ejecutará de nuevo con el nuevo facingMode
      }
      
      // Mostrar error al usuario
      const errorMessage = error instanceof Error ? error.message : 'Error al acceder a la cámara'
      setCameraError(`No se pudo acceder a la cámara ${facingMode === "user" ? "frontal" : "trasera"}. ${errorMessage}`)
      throw error
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    console.log('🛑 [SELFIE-CAPTURE] Deteniendo cámara...')
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      console.log('✅ [SELFIE-CAPTURE] Cámara detenida')
    }
  }, [stream])

  const switchCamera = useCallback(async () => {
    console.log('🔄 [SELFIE-CAPTURE] Cambiando cámara...')
    const newFacingMode = facingMode === "user" ? "environment" : "user"
    
    try {
      stopCamera()
      setFacingMode(newFacingMode)
      console.log(`✅ [SELFIE-CAPTURE] Cambiado a cámara ${newFacingMode === "user" ? "frontal" : "trasera"}`)
    } catch (error) {
      console.error('❌ [SELFIE-CAPTURE] Error cambiando cámara:', error)
    }
  }, [facingMode, stopCamera])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('� [SELFIE-CAPTURE] Archivo seleccionado:', file.name, 'Tamaño:', file.size)
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setCameraError('Por favor selecciona un archivo de imagen válido.')
        return
      }
      
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setCameraError('El archivo es demasiado grande. Máximo 10MB.')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        console.log('✅ [SELFIE-CAPTURE] Archivo cargado, tamaño:', result.length)
        setCapturedImage(result)
        setCameraError(null)
      }
      reader.onerror = () => {
        setCameraError('Error al leer el archivo.')
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const toggleMode = useCallback(() => {
    console.log('🔄 [SELFIE-CAPTURE] Cambiando modo:', useCamera ? 'cámara -> archivo' : 'archivo -> cámara')
    if (useCamera) {
      // Cambiando de cámara a archivo
      stopCamera()
      setUseCamera(false)
    } else {
      // Cambiando de archivo a cámara
      setUseCamera(true)
      setCameraError(null)
    }
  }, [useCamera, stopCamera])

  // Iniciar cámara al montar y cuando cambie facingMode, solo si useCamera es true
  useEffect(() => {
    console.log('🔄 [SELFIE-CAPTURE] useEffect: useCamera:', useCamera, 'facingMode:', facingMode)
    if (useCamera) {
      startCamera()
    }

    return () => {
      console.log('🧹 [SELFIE-CAPTURE] Limpiando recursos...')
      stopCamera()
    }
  }, [startCamera, stopCamera, facingMode, useCamera])

  const captureImage = useCallback(() => {
    console.log('📷 [SELFIE-CAPTURE] Capturando imagen...')
    
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        console.log('🖼️ [SELFIE-CAPTURE] Dimensiones del canvas:', {
          width: canvas.width,
          height: canvas.height
        })

        // Espejo horizontal para selfie
        context.translate(canvas.width, 0)
        context.scale(-1, 1)
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL("image/jpeg", 0.9)
        
        console.log('✅ [SELFIE-CAPTURE] Selfie capturada, tamaño:', imageData.length)
        setCapturedImage(imageData)
        stopCamera()
      }
    }
  }, [stopCamera])

  const startCountdown = useCallback(() => {
    console.log('⏱️ [SELFIE-CAPTURE] Iniciando cuenta regresiva...')
    setCountdown(3)
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          console.log('📷 [SELFIE-CAPTURE] ¡Capturando selfie!')
          captureImage()
          return null
        }
        console.log(`⏱️ [SELFIE-CAPTURE] Cuenta regresiva: ${prev - 1}`)
        return prev - 1
      })
    }, 1000)
  }, [captureImage])

  const retakeImage = useCallback(() => {
    console.log('🔄 [SELFIE-CAPTURE] Reiniciando captura...')
    setCapturedImage(null)
    setCountdown(null)
    setCameraError(null)
    
    // Resetear input file si existe
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    // Reiniciar cámara si está en modo cámara
    if (useCamera) {
      startCamera()
    }
  }, [startCamera, useCamera])

  const confirmImage = useCallback(() => {
    console.log('✅ [SELFIE-CAPTURE] Confirmando selfie...')
    if (capturedImage) {
      console.log('📤 [SELFIE-CAPTURE] Enviando selfie al padre')
      onCapture(capturedImage)
    }
  }, [capturedImage, onCapture])

  // Iniciar cámara al montar y cuando cambie facingMode
  useEffect(() => {
    console.log('🔄 [SELFIE-CAPTURE] useEffect: Iniciando cámara con facingMode:', facingMode)
    startCamera()

    return () => {
      console.log('🧹 [SELFIE-CAPTURE] Limpiando recursos...')
      stopCamera()
    }
  }, [startCamera, stopCamera, facingMode])

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Toma una selfie</h2>

      {cameraError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">{cameraError}</p>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <User className="h-4 w-4" />
          Consejos para una buena selfie:
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Asegúrate de tener buena iluminación</li>
          <li>• Mira directamente a la cámara</li>
          <li>• Mantén una expresión neutra</li>
          <li>• Quítate lentes de sol y gorras</li>
        </ul>
      </div>

      <div className="bg-black rounded-lg overflow-hidden mb-6 relative">
        {!capturedImage ? (
          useCamera ? (
            // Modo cámara
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-80 object-cover"
                style={{ transform: 'scaleX(-1)' }} // Espejo
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Indicador de cámara */}
              {isMobile && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {facingMode === "user" ? "Frontal" : "Trasera"}
                </div>
              )}

              {/* Guía de rostro */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-64 border-2 border-dashed border-white/70 rounded-full"></div>
              </div>

              {/* Cuenta regresiva */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white text-8xl font-bold">{countdown}</div>
                </div>
              )}
            </>
          ) : (
            // Modo subir archivo
            <div className="w-full h-80 flex flex-col items-center justify-center text-white">
              <Upload className="h-16 w-16 mb-4 opacity-70" />
              <p className="text-lg font-medium mb-2">Subir foto desde dispositivo</p>
              <p className="text-sm opacity-70 text-center px-4">
                Selecciona una imagen de tu galería para usarla como selfie
              </p>
            </div>
          )
        ) : (
          <img src={capturedImage} alt="Selfie" className="w-full h-80 object-cover" />
        )}
      </div>

      {capturedImage ? (
        <div className="flex gap-3">
          <button
            onClick={retakeImage}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tomar otra
          </button>

          <button
            onClick={confirmImage}
            className="flex-1 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar selfie
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Botón para alternar entre modos */}
          <div className="flex justify-center">
            <button
              onClick={toggleMode}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {useCamera ? <Upload className="h-4 w-4 mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
              {useCamera ? 'Subir desde dispositivo' : 'Usar cámara'}
            </button>
          </div>

          {/* Input file oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atrás
            </button>

            {useCamera ? (
              // Modo cámara - botones de cámara
              <div className="flex gap-2">
                {isMobile && (
                  <button
                    onClick={switchCamera}
                    disabled={!!cameraError}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Cambiar a cámara ${facingMode === "user" ? "trasera" : "frontal"}`}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={startCountdown}
                  disabled={countdown !== null || !!cameraError}
                  className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Tomar selfie
                </button>
              </div>
            ) : (
              // Modo archivo - botón para seleccionar archivo
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar imagen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
