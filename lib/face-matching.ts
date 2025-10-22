"use client"

import * as faceapi from 'face-api.js'

// Modelos pre-entrenados (los descargaremos automáticamente)
const MODEL_URL = '/models'

export interface FaceMatchResult {
  isMatch: boolean
  confidence: number
  error?: string
}

let modelsLoaded = false

/**
 * Carga los modelos de face-api.js
 */
export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return

  try {
    console.log('🤖 [FACE-MATCHING] Cargando modelos de face-api.js...')

    // Cargar modelos desde CDN público (face-api.js los descarga automáticamente)
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/')
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/')
    await faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/')

    modelsLoaded = true
    console.log('✅ [FACE-MATCHING] Modelos cargados exitosamente')
  } catch (error) {
    console.error('❌ [FACE-MATCHING] Error cargando modelos:', error)
    throw new Error('No se pudieron cargar los modelos de detección facial')
  }
}

/**
 * Convierte una imagen base64 a un elemento HTMLImageElement
 */
function base64ToImage(base64String: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = base64String
  })
}

/**
 * Extrae el descriptor facial de una imagen
 */
async function getFaceDescriptor(imageData: string): Promise<Float32Array | null> {
  try {
    const img = await base64ToImage(imageData)

    // Detectar rostro con landmarks
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!detection) {
      console.warn('⚠️ [FACE-MATCHING] No se detectó ningún rostro en la imagen')
      return null
    }

    console.log('✅ [FACE-MATCHING] Rostro detectado, descriptor generado')
    return detection.descriptor
  } catch (error) {
    console.error('❌ [FACE-MATCHING] Error procesando imagen:', error)
    return null
  }
}

/**
 * Compara dos rostros usando sus descriptores
 */
export async function compareFaces(
  face1Data: string,
  face2Data: string
): Promise<FaceMatchResult> {
  try {
    console.log('🔍 [FACE-MATCHING] Iniciando comparación facial...')

    // Asegurar que los modelos estén cargados
    await loadFaceModels()

    // Extraer descriptores de ambos rostros
    const [descriptor1, descriptor2] = await Promise.all([
      getFaceDescriptor(face1Data),
      getFaceDescriptor(face2Data)
    ])

    if (!descriptor1 || !descriptor2) {
      return {
        isMatch: false,
        confidence: 0,
        error: 'No se pudo detectar uno o ambos rostros'
      }
    }

    // Calcular distancia euclidiana entre descriptores
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2)

    // Convertir distancia a similitud (0 = diferente, 1 = igual)
    // Umbral típico: distancia < 0.6 = match, > 0.6 = no match
    const confidence = Math.max(0, Math.min(1, 1 - distance / 0.6))

    const isMatch = confidence > 0.8 // 80% de confianza mínima

    console.log('📊 [FACE-MATCHING] Resultado:', {
      distance: distance.toFixed(4),
      confidence: (confidence * 100).toFixed(1) + '%',
      isMatch
    })

    return {
      isMatch,
      confidence
    }

  } catch (error) {
    console.error('❌ [FACE-MATCHING] Error en comparación:', error)
    return {
      isMatch: false,
      confidence: 0,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Función de compatibilidad para el backend (simula comparación)
 * En producción, esta función debería usar compareFaces()
 */
export async function compareFacesForBackend(
  dniImageData: string,
  selfieImageData: string
): Promise<{ score: number; isMatch: boolean }> {
  try {
    // En desarrollo, usamos comparación real
    const result = await compareFaces(dniImageData, selfieImageData)

    return {
      score: result.confidence,
      isMatch: result.isMatch
    }
  } catch (error) {
    // Fallback: devolver score bajo pero no fallar completamente
    console.warn('⚠️ [FACE-MATCHING] Error en comparación, usando fallback')
    return {
      score: 0.3, // Score bajo indica posible problema
      isMatch: false
    }
  }
}