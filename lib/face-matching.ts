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
 * Compara dos rostros usando sus descriptores con validaciones mejoradas
 */
export async function compareFaces(
  face1Data: string,
  face2Data: string
): Promise<FaceMatchResult> {
  try {
    console.log('🔍 [FACE-MATCHING] Iniciando comparación facial mejorada...')
    console.log('🔍 [FACE-MATCHING-DEBUG] Datos de entrada:')
    console.log('  - face1Data length:', face1Data.length)
    console.log('  - face2Data length:', face2Data.length)
    console.log('  - face1Data type:', face1Data.substring(0, 20) + '...')
    console.log('  - face2Data type:', face2Data.substring(0, 20) + '...')

    // Asegurar que los modelos estén cargados
    console.log('🤖 [FACE-MATCHING-DEBUG] Cargando modelos...')
    await loadFaceModels()
    console.log('✅ [FACE-MATCHING-DEBUG] Modelos cargados')

    // Extraer descriptores de ambos rostros con múltiples intentos
    console.log('🔍 [FACE-MATCHING-DEBUG] Extrayendo descriptores...')
    const [descriptor1, descriptor2] = await Promise.all([
      getFaceDescriptorWithRetry(face1Data, 3),
      getFaceDescriptorWithRetry(face2Data, 3)
    ])

    console.log('🔍 [FACE-MATCHING-DEBUG] Descriptores extraídos:')
    console.log('  - descriptor1:', descriptor1 ? `Array(${descriptor1.length})` : 'null')
    console.log('  - descriptor2:', descriptor2 ? `Array(${descriptor2.length})` : 'null')

    if (!descriptor1 || !descriptor2) {
      console.log('❌ [FACE-MATCHING-DEBUG] Error: No se pudieron extraer descriptores')
      return {
        isMatch: false,
        confidence: 0,
        error: 'No se pudo detectar uno o ambos rostros después de múltiples intentos'
      }
    }

    // Calcular distancia euclidiana entre descriptores
    console.log('🔍 [FACE-MATCHING-DEBUG] Calculando distancia euclidiana...')
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2)
    console.log('🔍 [FACE-MATCHING-DEBUG] Distancia euclidiana:', distance.toFixed(6))

    // Validaciones adicionales de calidad
    console.log('🔍 [FACE-MATCHING-DEBUG] Realizando verificaciones de calidad...')
    const qualityChecks = await performQualityChecks(face1Data, face2Data)
    console.log('🔍 [FACE-MATCHING-DEBUG] Verificaciones de calidad:', qualityChecks)
    
    // Convertir distancia a similitud con umbrales adaptativos
    let confidence: number
    let isMatch: boolean

    console.log('🔍 [FACE-MATCHING-DEBUG] Aplicando umbrales adaptativos...')
    console.log('  - distance:', distance.toFixed(6))
    console.log('  - distance < 0.4:', distance < 0.4)
    console.log('  - distance < 0.6:', distance < 0.6)

    if (distance < 0.4) {
      // Muy similar
      confidence = Math.max(0.9, 1 - (distance / 0.4))
      isMatch = true
      console.log('  - Categoría: Muy similar')
    } else if (distance < 0.6) {
      // Similar pero requiere validación adicional
      confidence = Math.max(0.6, 1 - (distance / 0.6))
      isMatch = qualityChecks.pass && confidence > 0.7
      console.log('  - Categoría: Similar (requiere validación adicional)')
      console.log('  - qualityChecks.pass:', qualityChecks.pass)
      console.log('  - confidence > 0.7:', confidence > 0.7)
    } else {
      // Diferente
      confidence = Math.max(0, 1 - (distance / 0.8))
      isMatch = false
      console.log('  - Categoría: Diferente')
    }

    console.log('🔍 [FACE-MATCHING-DEBUG] Confianza inicial:', confidence.toFixed(6))

    // Ajustar confianza basado en calidad de imagen
    if (qualityChecks.pass) {
      const oldConfidence = confidence
      confidence = Math.min(1, confidence * 1.1) // Bonus por buena calidad
      console.log('  - Bonus por calidad:', oldConfidence.toFixed(6), '->', confidence.toFixed(6))
    } else {
      const oldConfidence = confidence
      confidence = Math.max(0, confidence * 0.8) // Penalización por mala calidad
      console.log('  - Penalización por calidad:', oldConfidence.toFixed(6), '->', confidence.toFixed(6))
    }

    console.log('🔍 [FACE-MATCHING-DEBUG] Resultado final:')
    console.log('  - distance:', distance.toFixed(6))
    console.log('  - confidence:', confidence.toFixed(6))
    console.log('  - isMatch:', isMatch)
    console.log('  - qualityChecks.pass:', qualityChecks.pass)

    console.log('📊 [FACE-MATCHING] Resultado mejorado:', {
      distance: distance.toFixed(4),
      confidence: (confidence * 100).toFixed(1) + '%',
      isMatch,
      qualityChecks: qualityChecks
    })

    return {
      isMatch,
      confidence
    }

  } catch (error) {
    console.error('❌ [FACE-MATCHING] Error en comparación:', error)
    console.error('❌ [FACE-MATCHING-DEBUG] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return {
      isMatch: false,
      confidence: 0,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Intenta obtener descriptor facial con reintentos
 */
async function getFaceDescriptorWithRetry(
  imageData: string, 
  maxRetries: number = 3
): Promise<Float32Array | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [FACE-MATCHING] Intento ${attempt}/${maxRetries} para extraer descriptor`)
      
      const descriptor = await getFaceDescriptor(imageData)
      if (descriptor) {
        console.log(`✅ [FACE-MATCHING] Descriptor extraído exitosamente en intento ${attempt}`)
        return descriptor
      }
    } catch (error) {
      console.warn(`⚠️ [FACE-MATCHING] Intento ${attempt} falló:`, error)
    }
    
    // Esperar un poco antes del siguiente intento
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  console.error('❌ [FACE-MATCHING] Todos los intentos fallaron')
  return null
}

/**
 * Realiza verificaciones de calidad de imagen
 */
async function performQualityChecks(
  image1Data: string, 
  image2Data: string
): Promise<{ pass: boolean; details: any }> {
  try {
    const [img1, img2] = await Promise.all([
      base64ToImage(image1Data),
      base64ToImage(image2Data)
    ])

    // Verificar resolución mínima
    const minResolution = 200
    const resolution1 = Math.min(img1.width, img1.height)
    const resolution2 = Math.min(img2.width, img2.height)
    
    const hasMinResolution = resolution1 >= minResolution && resolution2 >= minResolution

    // Verificar que las imágenes no sean demasiado pequeñas
    const hasReasonableSize = img1.width > 100 && img1.height > 100 && 
                             img2.width > 100 && img2.height > 100

    const qualityChecks = {
      hasMinResolution,
      hasReasonableSize,
      resolution1,
      resolution2
    }

    const pass = hasMinResolution && hasReasonableSize

    console.log('🔍 [FACE-MATCHING] Verificaciones de calidad:', qualityChecks)

    return { pass, details: qualityChecks }

  } catch (error) {
    console.warn('⚠️ [FACE-MATCHING] Error en verificaciones de calidad:', error)
    return { pass: false, details: { error: error instanceof Error ? error.message : 'Unknown' } }
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