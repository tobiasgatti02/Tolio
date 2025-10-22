"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, RefreshCw, Check, ArrowLeft, AlertCircle } from "lucide-react"
import { BrowserPDF417Reader } from '@zxing/browser'

interface PDF417Data {
  documentNumber: string
  firstName: string
  lastName: string
  birthDate: string
  gender: string
  expirationDate: string
  rawData: string
}

interface DniPDF417CaptureProps {
  onCapture: (imageData: string, pdf417Data: PDF417Data) => void
  onBack: () => void
}

export default function DniPDF417Capture({ onCapture, onBack }: DniPDF417CaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [pdf417Data, setPdf417Data] = useState<PDF417Data | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  console.log('🎥 [DNI-PDF417-CAPTURE] Componente montado')

  const startCamera = useCallback(async () => {
    console.log('📸 [DNI-PDF417-CAPTURE] Iniciando cámara...')
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
      })
      setStream(mediaStream)
      console.log('✅ [DNI-PDF417-CAPTURE] Cámara iniciada')

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          console.log('📐 [DNI-PDF417-CAPTURE] Video dimensions:', {
            width: videoRef.current?.videoWidth,
            height: videoRef.current?.videoHeight
          })
        }
      }
    } catch (error) {
      console.error('❌ [DNI-PDF417-CAPTURE] Error al acceder a la cámara:', error)
      setError('No se pudo acceder a la cámara. Verifica los permisos.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    console.log('🛑 [DNI-PDF417-CAPTURE] Deteniendo cámara...')
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      console.log('✅ [DNI-PDF417-CAPTURE] Cámara detenida')
    }
  }, [stream])

  const parsePDF417Data = (text: string): PDF417Data | null => {
    console.log('📋 [DNI-PDF417-CAPTURE] Parseando datos PDF417...')
    console.log('📄 [DNI-PDF417-CAPTURE] Texto completo:', text)
    
    try {
      // Formato del PDF417 argentino (puede variar)
      // Generalmente viene separado por @ o caracteres especiales
      const parts = text.split('@')
      
      console.log('🔍 [DNI-PDF417-CAPTURE] Partes encontradas:', parts.length)
      parts.forEach((part, index) => {
        console.log(`  Parte ${index}:`, part)
      })

      // Intentar diferentes formatos
      // Formato común: NÚMERO@APELLIDO@NOMBRE@SEXO@DNI@FECHA_NAC@FECHA_EXP
      if (parts.length >= 7) {
        const data: PDF417Data = {
          documentNumber: parts[4] || parts[0],
          lastName: parts[1],
          firstName: parts[2],
          gender: parts[3],
          birthDate: parts[5],
          expirationDate: parts[6],
          rawData: text
        }
        
        console.log('✅ [DNI-PDF417-CAPTURE] Datos parseados exitosamente:', data)
        return data
      }

      console.log('⚠️ [DNI-PDF417-CAPTURE] Formato no reconocido, usando datos parciales')
      // Si no coincide con el formato esperado, intentar extraer lo que podamos
      return {
        documentNumber: parts[0] || 'N/A',
        firstName: parts[1] || 'N/A',
        lastName: parts[2] || 'N/A',
        gender: 'N/A',
        birthDate: 'N/A',
        expirationDate: 'N/A',
        rawData: text
      }
    } catch (error) {
      console.error('❌ [DNI-PDF417-CAPTURE] Error parseando datos:', error)
      return null
    }
  }

  const scanPDF417 = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || scanning) return

    console.log('🔍 [DNI-PDF417-CAPTURE] Iniciando escaneo PDF417...')
    setScanning(true)
    setError(null)

    try {
      const codeReader = new BrowserPDF417Reader()
      console.log('📱 [DNI-PDF417-CAPTURE] Reader inicializado')

      const result = await codeReader.decodeOnceFromVideoElement(videoRef.current)
      
      console.log('🎯 [DNI-PDF417-CAPTURE] Código detectado!')
      console.log('📊 [DNI-PDF417-CAPTURE] Resultado completo:', result)

      const parsedData = parsePDF417Data(result.getText())

      if (parsedData) {
        console.log('✅ [DNI-PDF417-CAPTURE] Datos extraídos correctamente')
        setPdf417Data(parsedData)
        
        // Capturar la imagen actual
        captureImage()
      } else {
        console.log('⚠️ [DNI-PDF417-CAPTURE] No se pudieron parsear los datos')
        setError('No se pudo leer el código PDF417. Intenta de nuevo.')
      }
    } catch (error) {
      console.log('⚠️ [DNI-PDF417-CAPTURE] No se detectó código PDF417:', error)
      // No mostramos error porque es normal que no siempre detecte
    } finally {
      setScanning(false)
    }
  }, [scanning])

  const captureImage = useCallback(() => {
    console.log('📷 [DNI-PDF417-CAPTURE] Capturando imagen...')
    
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        console.log('🖼️ [DNI-PDF417-CAPTURE] Dimensiones del canvas:', {
          width: canvas.width,
          height: canvas.height
        })

        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL("image/jpeg", 0.9)
        
        console.log('✅ [DNI-PDF417-CAPTURE] Imagen capturada, tamaño:', imageData.length)
        setCapturedImage(imageData)
        stopCamera()
      }
    }
  }, [stopCamera])

  const retakeImage = useCallback(() => {
    console.log('🔄 [DNI-PDF417-CAPTURE] Reiniciando captura...')
    setCapturedImage(null)
    setPdf417Data(null)
    setError(null)
    startCamera()
  }, [startCamera])

  const confirmImage = useCallback(() => {
    console.log('✅ [DNI-PDF417-CAPTURE] Confirmando captura...')
    if (capturedImage && pdf417Data) {
      console.log('📤 [DNI-PDF417-CAPTURE] Enviando datos al padre')
      onCapture(capturedImage, pdf417Data)
    } else {
      console.log('⚠️ [DNI-PDF417-CAPTURE] Faltan datos para confirmar')
      setError('Faltan datos. Por favor, intenta de nuevo.')
    }
  }, [capturedImage, pdf417Data, onCapture])

  // Iniciar cámara al montar
  useEffect(() => {
    console.log('🔄 [DNI-PDF417-CAPTURE] useEffect: Iniciando cámara')
    startCamera()

    return () => {
      console.log('🧹 [DNI-PDF417-CAPTURE] Limpiando recursos...')
      stopCamera()
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
      }
    }
  }, [])

  // Escanear continuamente cuando la cámara está activa
  useEffect(() => {
    if (stream && !capturedImage) {
      console.log('🔄 [DNI-PDF417-CAPTURE] Iniciando escaneo automático...')
      scanIntervalRef.current = setInterval(() => {
        scanPDF417()
      }, 1000) // Escanear cada segundo

      return () => {
        if (scanIntervalRef.current) {
          console.log('🛑 [DNI-PDF417-CAPTURE] Deteniendo escaneo automático')
          clearInterval(scanIntervalRef.current)
        }
      }
    }
  }, [stream, capturedImage, scanPDF417])

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Escanea el código PDF417 de tu DNI
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-black rounded-lg overflow-hidden mb-6 relative">
        {!capturedImage ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Guía de captura */}
            <div className="absolute inset-0 border-2 border-dashed border-emerald-400/70 m-6 pointer-events-none"></div>
            
            {/* Indicador de escaneo */}
            {scanning && (
              <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Escaneando...
              </div>
            )}

            {/* Indicador de código detectado */}
            {pdf417Data && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <Check className="h-4 w-4" />
                Código detectado
              </div>
            )}
          </>
        ) : (
          <img src={capturedImage} alt="DNI capturado" className="w-full h-64 object-cover" />
        )}
      </div>

      {/* Mostrar datos extraídos */}
      {pdf417Data && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-emerald-900 mb-2">Datos detectados:</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">DNI:</span> {pdf417Data.documentNumber}</p>
            <p><span className="font-medium">Nombre:</span> {pdf417Data.firstName}</p>
            <p><span className="font-medium">Apellido:</span> {pdf417Data.lastName}</p>
            <p><span className="font-medium">Sexo:</span> {pdf417Data.gender}</p>
            <p><span className="font-medium">Fecha de Nacimiento:</span> {pdf417Data.birthDate}</p>
          </div>
        </div>
      )}

      {capturedImage && pdf417Data ? (
        <div className="flex gap-3">
          <button
            onClick={retakeImage}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Volver a capturar
          </button>

          <button
            onClick={confirmImage}
            className="flex-1 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Atrás
          </button>

          <p className="text-sm text-gray-500 italic">
            Coloca el dorso del DNI bajo la cámara
          </p>

          <button
            onClick={captureImage}
            disabled={!pdf417Data}
            className={`flex items-center px-4 py-2 rounded-lg font-medium ${
              pdf417Data
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Camera className="h-4 w-4 mr-2" />
            Capturar
          </button>
        </div>
      )}
    </div>
  )
}
