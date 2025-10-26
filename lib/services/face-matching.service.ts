/**
 * Face Matching Service - Comparación avanzada de rostros
 * Arquitectura limpia: Servicio especializado en comparación facial
 */

import * as faceapi from 'face-api.js'

export interface FaceMatchResult {
  isMatch: boolean
  confidence: number
  similarity: number
  error?: string
}

export interface FaceDescriptor {
  descriptor: Float32Array
  landmarks: faceapi.FaceLandmarks68
  detection: faceapi.FaceDetection
}

export class FaceMatchingService {
  private static instance: FaceMatchingService
  private modelsLoaded = false

  private constructor() {}

  static getInstance(): FaceMatchingService {
    if (!FaceMatchingService.instance) {
      FaceMatchingService.instance = new FaceMatchingService()
    }
    return FaceMatchingService.instance
  }

  /**
   * Carga los modelos necesarios para face matching
   */
  private async loadModels(): Promise<void> {
    if (this.modelsLoaded) return

    try {
      console.log('🤖 [FACE-MATCHING-SERVICE] Cargando modelos...')

      await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/')
      await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/')
      await faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/')

      this.modelsLoaded = true
      console.log('✅ [FACE-MATCHING-SERVICE] Modelos cargados')
    } catch (error) {
      console.error('❌ [FACE-MATCHING-SERVICE] Error cargando modelos:', error)
      throw error
    }
  }

  /**
   * Extrae descriptor facial de una imagen
   */
  async extractFaceDescriptor(imageData: string): Promise<FaceDescriptor | null> {
    await this.loadModels()

    try {
      const img = await this.base64ToImage(imageData)

      // Detectar rostro con landmarks y descriptor
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection) {
        console.warn('⚠️ [FACE-MATCHING-SERVICE] No se detectó rostro en la imagen')
        return null
      }

      console.log('✅ [FACE-MATCHING-SERVICE] Rostro detectado y descriptor extraído')

      return {
        descriptor: detection.descriptor,
        landmarks: detection.landmarks,
        detection: detection.detection
      }

    } catch (error) {
      console.error('❌ [FACE-MATCHING-SERVICE] Error extrayendo descriptor:', error)
      return null
    }
  }

  /**
   * Compara dos descriptores faciales
   */
  async compareFaces(
    face1: FaceDescriptor,
    face2: FaceDescriptor,
    threshold: number = 0.8
  ): Promise<FaceMatchResult> {
    try {
      console.log('🔍 [FACE-MATCHING-SERVICE] Comparando rostros...')

      // Calcular distancia euclidiana
      const distance = faceapi.euclideanDistance(face1.descriptor, face2.descriptor)

      // Convertir distancia a similitud (0-1)
      // Umbral típico: distancia < 0.6 = match probable
      const similarity = Math.max(0, Math.min(1, 1 - distance / 0.6))

      // Aplicar threshold
      const isMatch = similarity >= threshold
      const confidence = similarity

      console.log('📊 [FACE-MATCHING-SERVICE] Resultado:', {
        distance: distance.toFixed(4),
        similarity: (similarity * 100).toFixed(1) + '%',
        threshold: (threshold * 100).toFixed(1) + '%',
        isMatch
      })

      return {
        isMatch,
        confidence,
        similarity
      }

    } catch (error) {
      console.error('❌ [FACE-MATCHING-SERVICE] Error comparando rostros:', error)
      return {
        isMatch: false,
        confidence: 0,
        similarity: 0,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Método de comparación directa entre dos imágenes
   */
  async compareImages(
    image1Data: string,
    image2Data: string,
    threshold: number = 0.8
  ): Promise<FaceMatchResult> {
    try {
      console.log('🖼️ [FACE-MATCHING-SERVICE] Comparando imágenes...')

      // Extraer descriptores de ambas imágenes
      const [face1, face2] = await Promise.all([
        this.extractFaceDescriptor(image1Data),
        this.extractFaceDescriptor(image2Data)
      ])

      if (!face1 || !face2) {
        return {
          isMatch: false,
          confidence: 0,
          similarity: 0,
          error: 'No se pudo detectar uno o ambos rostros'
        }
      }

      return await this.compareFaces(face1, face2, threshold)

    } catch (error) {
      console.error('❌ [FACE-MATCHING-SERVICE] Error comparando imágenes:', error)
      return {
        isMatch: false,
        confidence: 0,
        similarity: 0,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Compara un rostro con múltiples candidatos y devuelve el mejor match
   */
  async findBestMatch(
    targetFace: FaceDescriptor,
    candidateFaces: FaceDescriptor[],
    threshold: number = 0.8
  ): Promise<FaceMatchResult & { bestMatchIndex?: number }> {
    if (candidateFaces.length === 0) {
      return {
        isMatch: false,
        confidence: 0,
        similarity: 0,
        error: 'No hay rostros candidatos'
      }
    }

    let bestMatch: FaceMatchResult & { bestMatchIndex?: number } = {
      isMatch: false,
      confidence: 0,
      similarity: 0
    }

    for (let i = 0; i < candidateFaces.length; i++) {
      const result = await this.compareFaces(targetFace, candidateFaces[i], threshold)

      if (result.similarity > bestMatch.similarity) {
        bestMatch = {
          ...result,
          bestMatchIndex: i
        }
      }
    }

    return bestMatch
  }

  /**
   * Convierte base64 a HTMLImageElement
   */
  private async base64ToImage(base64String: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = base64String
    })
  }

  /**
   * Método de utilidad para validar calidad de rostro
   */
  validateFaceQuality(face: FaceDescriptor): {
    isValid: boolean
    issues: string[]
  } {
    const issues: string[] = []

    // Verificar tamaño del rostro
    const { width, height } = face.detection.box
    const faceSize = Math.min(width, height)

    if (faceSize < 100) {
      issues.push('Rostro demasiado pequeño')
    }

    // Verificar score de detección
    if (face.detection.score < 0.7) {
      issues.push('Detección de rostro poco confiable')
    }

    // Verificar landmarks
    const landmarkCount = face.landmarks.positions.length
    if (landmarkCount < 68) {
      issues.push('Landmarks faciales incompletos')
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }
}