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

      await faceapi.nets.tinyFaceDetector.loadFromUri('https://unpkg.com/face-api.js@0.22.2/weights/')
      await faceapi.nets.faceLandmark68Net.loadFromUri('https://unpkg.com/face-api.js@0.22.2/weights/')
      await faceapi.nets.faceRecognitionNet.loadFromUri('https://unpkg.com/face-api.js@0.22.2/weights/')

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
      console.log('🔍 [FACE-MATCHING-SERVICE] Iniciando extracción de descriptor facial')
      console.log('📊 [FACE-MATCHING-SERVICE] Datos de imagen:', {
        hasImageData: !!imageData,
        imageDataLength: imageData.length,
        startsWithDataUrl: imageData.startsWith('data:image')
      })

      const img = await this.base64ToImage(imageData)
      console.log('✅ [FACE-MATCHING-SERVICE] Imagen convertida a HTMLImageElement:', {
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      })

      // Detectar rostro con landmarks y descriptor
      console.log('🔍 [FACE-MATCHING-SERVICE] Detectando rostro con face-api.js...')
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor()

      console.log('📊 [FACE-MATCHING-SERVICE] Resultado de detección:', {
        hasDetection: !!detection,
        detectionScore: detection?.detection?.score,
        hasLandmarks: !!detection?.landmarks,
        landmarksCount: detection?.landmarks?.positions?.length,
        hasDescriptor: !!detection?.descriptor,
        descriptorLength: detection?.descriptor?.length
      })

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
      console.error('❌ [FACE-MATCHING-SERVICE] Detalles del error:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      })
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
    console.log('🔍 [FACE-MATCHING-SERVICE] Iniciando comparación de descriptores faciales')
    console.log('� [FACE-MATCHING-SERVICE] Parámetros de entrada:', {
      hasFace1: !!face1,
      hasFace2: !!face2,
      face1DescriptorLength: face1?.descriptor?.length,
      face2DescriptorLength: face2?.descriptor?.length,
      threshold
    })

    try {
      console.log('🔍 [FACE-MATCHING-SERVICE] Calculando distancia euclidiana...')

      // Calcular distancia euclidiana
      const distance = faceapi.euclideanDistance(face1.descriptor, face2.descriptor)
      console.log('📊 [FACE-MATCHING-SERVICE] Distancia euclidiana calculada:', distance.toFixed(6))

      // Convertir distancia a similitud (0-1)
      // Umbral típico: distancia < 0.6 = match probable
      const similarity = Math.max(0, Math.min(1, 1 - distance / 0.6))
      console.log('📊 [FACE-MATCHING-SERVICE] Similitud calculada:', (similarity * 100).toFixed(2) + '%')

      // Aplicar threshold
      const isMatch = similarity >= threshold
      const confidence = similarity

      console.log('📊 [FACE-MATCHING-SERVICE] Resultado final:', {
        distance: distance.toFixed(4),
        similarity: (similarity * 100).toFixed(1) + '%',
        threshold: (threshold * 100).toFixed(1) + '%',
        isMatch,
        confidence: (confidence * 100).toFixed(1) + '%'
      })

      return {
        isMatch,
        confidence,
        similarity
      }

    } catch (error) {
      console.error('❌ [FACE-MATCHING-SERVICE] Error comparando rostros:', error)
      console.error('❌ [FACE-MATCHING-SERVICE] Detalles del error:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      })
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
    console.log('🖼️ [FACE-MATCHING-SERVICE] Iniciando comparación entre dos imágenes')
    console.log('📊 [FACE-MATCHING-SERVICE] Parámetros:', {
      hasImage1: !!image1Data,
      image1Length: image1Data?.length || 0,
      hasImage2: !!image2Data,
      image2Length: image2Data?.length || 0,
      threshold
    })

    try {
      console.log('� [FACE-MATCHING-SERVICE] Extrayendo descriptores de ambas imágenes...')

      // Extraer descriptores de ambas imágenes
      const [face1, face2] = await Promise.all([
        this.extractFaceDescriptor(image1Data),
        this.extractFaceDescriptor(image2Data)
      ])

      console.log('📊 [FACE-MATCHING-SERVICE] Resultados de extracción:', {
        face1Extracted: !!face1,
        face2Extracted: !!face2,
        face1DetectionScore: face1?.detection?.score,
        face2DetectionScore: face2?.detection?.score
      })

      if (!face1 || !face2) {
        const error = 'No se pudo detectar uno o ambos rostros'
        console.error('❌ [FACE-MATCHING-SERVICE] Error de extracción:', {
          face1: !!face1,
          face2: !!face2,
          error
        })
        return {
          isMatch: false,
          confidence: 0,
          similarity: 0,
          error
        }
      }

      console.log('✅ [FACE-MATCHING-SERVICE] Ambos rostros extraídos, procediendo a comparación...')
      return await this.compareFaces(face1, face2, threshold)

    } catch (error) {
      console.error('❌ [FACE-MATCHING-SERVICE] Error comparando imágenes:', error)
      console.error('❌ [FACE-MATCHING-SERVICE] Detalles del error:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      })
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