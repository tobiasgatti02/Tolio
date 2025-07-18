"use client"

import { useState, useRef, useCallback } from "react"
import { Camera, RefreshCw, Check, ArrowLeft } from "lucide-react"

interface DniCaptureProps {
  side: "front" | "back"
  onCapture: (imageData: string) => void
  onBack: () => void
}

export default function DniCapture({ side, onCapture, onBack }: DniCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Establecer dimensiones del canvas al tamaño del video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Dibujar el frame actual del video en el canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convertir a imagen
        const imageData = canvas.toDataURL("image/jpeg")
        setCapturedImage(imageData)
        stopCamera()
      }
    }
  }, [stopCamera])

  const retakeImage = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const confirmImage = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }, [capturedImage, onCapture])

  // Iniciar la cámara al montar el componente
  useState(() => {
    startCamera()

    // Limpiar al desmontar
    return () => {
      stopCamera()
    }
  })

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {side === "front" ? "Captura el frente de tu DNI" : "Captura el dorso de tu DNI"}
      </h2>

      <div className="bg-black rounded-lg overflow-hidden mb-6 relative">
        {!capturedImage ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />

            {/* Guía de captura */}
            <div className="absolute inset-0 border-2 border-dashed border-white/70 m-6 pointer-events-none"></div>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button onClick={captureImage} className="bg-white rounded-full p-3">
                <Camera className="h-6 w-6 text-emerald-600" />
              </button>
            </div>
          </>
        ) : (
          <div className="relative">
            <img src={capturedImage || "/placeholder.svg"} alt={`DNI ${side}`} className="w-full h-64 object-contain" />
          </div>
        )}
      </div>

      {/* Canvas oculto para capturar la imagen */}
      <canvas ref={canvasRef} className="hidden" />

      {capturedImage ? (
        <div className="flex justify-between">
          <button
            onClick={retakeImage}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Volver a capturar
          </button>

          <button
            onClick={confirmImage}
            className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar
          </button>
        </div>
      ) : (
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Atrás
          </button>

          <p className="text-sm text-gray-500 italic">Asegúrate de que todo el DNI sea visible</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Consejos:</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Asegúrate de que el DNI esté bien iluminado</li>
          <li>• Evita reflejos o sombras sobre el documento</li>
          <li>• Coloca el DNI dentro del marco punteado</li>
          {side === "front" && <li>• Asegúrate de que tu foto y número de DNI sean visibles</li>}
          {side === "back" && <li>• Asegúrate de que el código de barras sea visible</li>}
        </ul>
      </div>
    </div>
  )
}

