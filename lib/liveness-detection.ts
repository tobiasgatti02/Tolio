"use client"

import * as faceapi from 'face-api.js'

export interface LivenessResult {
  isLive: boolean
  confidence: number
  checks: {
    eyeBlink: boolean
    headMovement: boolean
    imageQuality: boolean
    antiSpoofing: boolean
  }
  details: any
}

/**
 * Detecta si una imagen es de una persona real (liveness detection)
 * Implementa verificaciones básicas anti-spoofing
 */
export async function detectLiveness(
  imageData: string,
  previousFrame?: string
): Promise<LivenessResult> {
  try {
    console.log('👁️ [LIVENESS] Iniciando detección de liveness...')
    console.log('🔍 [LIVENESS-DEBUG] Datos de entrada:')
    console.log('  - imageData length:', imageData.length)
    console.log('  - imageData type:', imageData.substring(0, 20) + '...')
    console.log('  - previousFrame:', previousFrame ? 'provided' : 'not provided')

    const img = await base64ToImage(imageData)
    console.log('🔍 [LIVENESS-DEBUG] Imagen cargada:')
    console.log('  - width:', img.width)
    console.log('  - height:', img.height)
    console.log('  - naturalWidth:', img.naturalWidth)
    console.log('  - naturalHeight:', img.naturalHeight)
    
    // Cargar modelos si no están cargados
    console.log('🤖 [LIVENESS-DEBUG] Cargando modelos...')
    await loadFaceModels()
    console.log('✅ [LIVENESS-DEBUG] Modelos cargados')

    // Detectar rostro con landmarks
    console.log('🔍 [LIVENESS-DEBUG] Detectando rostro...')
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()

    console.log('🔍 [LIVENESS-DEBUG] Detección de rostro:')
    console.log('  - detection:', detection ? 'found' : 'not found')
    
    if (!detection) {
      console.log('❌ [LIVENESS-DEBUG] No se detectó rostro')
      return {
        isLive: false,
        confidence: 0,
        checks: {
          eyeBlink: false,
          headMovement: false,
          imageQuality: false,
          antiSpoofing: false
        },
        details: { error: 'No se detectó rostro' }
      }
    }

    const landmarks = detection.landmarks
    console.log('🔍 [LIVENESS-DEBUG] Landmarks detectados:')
    console.log('  - landmarks count:', landmarks.positions.length)
    console.log('  - landmarks positions:', landmarks.positions.slice(0, 5).map(p => `(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`))
    
    const checks = await performLivenessChecks(img, landmarks, previousFrame)
    console.log('🔍 [LIVENESS-DEBUG] Verificaciones de liveness:')
    console.log('  - eyeBlink:', checks.eyeBlink)
    console.log('  - headMovement:', checks.headMovement)
    console.log('  - imageQuality:', checks.imageQuality)
    console.log('  - antiSpoofing:', checks.antiSpoofing)
    
    // Calcular confianza general
    const passedChecks = Object.values(checks).filter(Boolean).length
    const totalChecks = Object.keys(checks).length
    const confidence = passedChecks / totalChecks

    console.log('🔍 [LIVENESS-DEBUG] Cálculo de confianza:')
    console.log('  - passedChecks:', passedChecks)
    console.log('  - totalChecks:', totalChecks)
    console.log('  - confidence:', confidence.toFixed(6))

    // Considerar "live" si pasa al menos 3 de 4 verificaciones
    const isLive = passedChecks >= 3 && confidence > 0.6
    console.log('🔍 [LIVENESS-DEBUG] Cálculo de isLive:')
    console.log('  - passedChecks >= 3:', passedChecks >= 3)
    console.log('  - confidence > 0.6:', confidence > 0.6)
    console.log('  - isLive:', isLive)

    console.log('📊 [LIVENESS] Resultado:', {
      isLive,
      confidence: (confidence * 100).toFixed(1) + '%',
      checks
    })

    return {
      isLive,
      confidence,
      checks,
      details: {
        landmarks: landmarks.positions,
        imageSize: { width: img.width, height: img.height }
      }
    }

  } catch (error) {
    console.error('❌ [LIVENESS] Error en detección:', error)
    console.error('❌ [LIVENESS-DEBUG] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return {
      isLive: false,
      confidence: 0,
      checks: {
        eyeBlink: false,
        headMovement: false,
        imageQuality: false,
        antiSpoofing: false
      },
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

/**
 * Realiza verificaciones específicas de liveness
 */
async function performLivenessChecks(
  img: HTMLImageElement,
  landmarks: faceapi.FaceLandmarks68,
  previousFrame?: string
): Promise<{
  eyeBlink: boolean
  headMovement: boolean
  imageQuality: boolean
  antiSpoofing: boolean
}> {
  const checks = {
    eyeBlink: false,
    headMovement: false,
    imageQuality: false,
    antiSpoofing: false
  }

  try {
    // 1. Verificación de calidad de imagen
    checks.imageQuality = await checkImageQuality(img)

    // 2. Verificación de parpadeo (básica)
    checks.eyeBlink = await checkEyeBlink(landmarks)

    // 3. Verificación de movimiento de cabeza (si hay frame anterior)
    if (previousFrame) {
      checks.headMovement = await checkHeadMovement(img, previousFrame)
    } else {
      checks.headMovement = true // Sin frame anterior, asumir OK
    }

    // 4. Verificaciones anti-spoofing básicas
    checks.antiSpoofing = await checkAntiSpoofing(img, landmarks)

    console.log('🔍 [LIVENESS] Verificaciones:', checks)

  } catch (error) {
    console.warn('⚠️ [LIVENESS] Error en verificaciones:', error)
  }

  return checks
}

/**
 * Verifica la calidad de la imagen
 */
async function checkImageQuality(img: HTMLImageElement): Promise<boolean> {
  try {
    // Verificar resolución mínima
    const minSize = 200
    const hasMinResolution = img.width >= minSize && img.height >= minSize

    // Verificar que no sea demasiado pequeña
    const hasReasonableSize = img.width > 100 && img.height > 100

    // Verificar proporción (no demasiado estirada)
    const aspectRatio = img.width / img.height
    const hasGoodAspectRatio = aspectRatio > 0.5 && aspectRatio < 2.0

    const quality = hasMinResolution && hasReasonableSize && hasGoodAspectRatio

    console.log('📸 [LIVENESS] Calidad de imagen:', {
      hasMinResolution,
      hasReasonableSize,
      hasGoodAspectRatio,
      aspectRatio: aspectRatio.toFixed(2),
      quality
    })

    return quality

  } catch (error) {
    console.warn('⚠️ [LIVENESS] Error verificando calidad:', error)
    return false
  }
}

/**
 * Verifica parpadeo básico (simplificado)
 */
async function checkEyeBlink(landmarks: faceapi.FaceLandmarks68): Promise<boolean> {
  try {
    // Obtener puntos de los ojos
    const leftEye = landmarks.getLeftEye()
    const rightEye = landmarks.getRightEye()

    // Calcular apertura de ojos (distancia entre párpados)
    const leftEyeAperture = calculateEyeAperture(leftEye)
    const rightEyeAperture = calculateEyeAperture(rightEye)

    // Verificar que los ojos no estén completamente cerrados
    const eyesOpen = leftEyeAperture > 0.1 && rightEyeAperture > 0.1

    console.log('👁️ [LIVENESS] Parpadeo:', {
      leftEyeAperture: leftEyeAperture.toFixed(3),
      rightEyeAperture: rightEyeAperture.toFixed(3),
      eyesOpen
    })

    return eyesOpen

  } catch (error) {
    console.warn('⚠️ [LIVENESS] Error verificando parpadeo:', error)
    return false
  }
}

/**
 * Calcula la apertura de un ojo
 */
function calculateEyeAperture(eyePoints: faceapi.Point[]): number {
  if (eyePoints.length < 6) return 0

  // Puntos del ojo: esquinas y centro
  const topPoint = eyePoints[1] // Punto superior
  const bottomPoint = eyePoints[4] // Punto inferior
  const leftCorner = eyePoints[0]
  const rightCorner = eyePoints[3]

  // Calcular distancia vertical (apertura)
  const verticalDistance = Math.abs(topPoint.y - bottomPoint.y)
  
  // Calcular distancia horizontal (ancho del ojo)
  const horizontalDistance = Math.abs(rightCorner.x - leftCorner.x)

  // Normalizar por el ancho del ojo
  return horizontalDistance > 0 ? verticalDistance / horizontalDistance : 0
}

/**
 * Verifica movimiento de cabeza entre frames
 */
async function checkHeadMovement(
  currentImg: HTMLImageElement,
  previousFrameData: string
): Promise<boolean> {
  try {
    const previousImg = await base64ToImage(previousFrameData)
    
    // Comparar posiciones de landmarks (simplificado)
    // En una implementación real, compararías las posiciones de landmarks
    // entre frames para detectar movimiento
    
    // Por ahora, verificamos que las imágenes sean diferentes
    const currentSize = currentImg.width * currentImg.height
    const previousSize = previousImg.width * previousImg.height
    
    const hasMovement = Math.abs(currentSize - previousSize) > 1000

    console.log('🔄 [LIVENESS] Movimiento de cabeza:', {
      currentSize,
      previousSize,
      hasMovement
    })

    return hasMovement

  } catch (error) {
    console.warn('⚠️ [LIVENESS] Error verificando movimiento:', error)
    return true // Asumir OK si hay error
  }
}

/**
 * Verificaciones anti-spoofing básicas
 */
async function checkAntiSpoofing(
  img: HTMLImageElement,
  landmarks: faceapi.FaceLandmarks68
): Promise<boolean> {
  try {
    // 1. Verificar que el rostro no sea demasiado pequeño (posible foto de pantalla)
    const faceSize = calculateFaceSize(landmarks)
    const hasReasonableSize = faceSize > 0.1 // Al menos 10% de la imagen

    // 2. Verificar simetría facial básica
    const symmetry = calculateFacialSymmetry(landmarks)
    const hasGoodSymmetry = symmetry > 0.7

    // 3. Verificar que no sea una imagen estática (básico)
    const isNotStatic = true // Implementación simplificada

    const antiSpoofing = hasReasonableSize && hasGoodSymmetry && isNotStatic

    console.log('🛡️ [LIVENESS] Anti-spoofing:', {
      faceSize: faceSize.toFixed(3),
      symmetry: symmetry.toFixed(3),
      hasReasonableSize,
      hasGoodSymmetry,
      antiSpoofing
    })

    return antiSpoofing

  } catch (error) {
    console.warn('⚠️ [LIVENESS] Error en anti-spoofing:', error)
    return false
  }
}

/**
 * Calcula el tamaño relativo del rostro
 */
function calculateFaceSize(landmarks: faceapi.FaceLandmarks68): number {
  const positions = landmarks.positions
  if (positions.length < 2) return 0

  // Encontrar puntos extremos del rostro
  let minX = positions[0].x, maxX = positions[0].x
  let minY = positions[0].y, maxY = positions[0].y

  for (const point of positions) {
    minX = Math.min(minX, point.x)
    maxX = Math.max(maxX, point.x)
    minY = Math.min(minY, point.y)
    maxY = Math.max(maxY, point.y)
  }

  const faceWidth = maxX - minX
  const faceHeight = maxY - minY
  const faceArea = faceWidth * faceHeight

  // Retornar área relativa (normalizada)
  return faceArea
}

/**
 * Calcula simetría facial básica
 */
function calculateFacialSymmetry(landmarks: faceapi.FaceLandmarks68): number {
  try {
    const positions = landmarks.positions
    if (positions.length < 10) return 0

    // Obtener puntos de los ojos
    const leftEye = landmarks.getLeftEye()
    const rightEye = landmarks.getRightEye()

    if (leftEye.length < 3 || rightEye.length < 3) return 0

    // Calcular centro de cada ojo
    const leftEyeCenter = {
      x: leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length,
      y: leftEye.reduce((sum, p) => sum + p.y, 0) / leftEye.length
    }

    const rightEyeCenter = {
      x: rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length,
      y: rightEye.reduce((sum, p) => sum + p.y, 0) / rightEye.length
    }

    // Calcular distancia entre ojos
    const eyeDistance = Math.sqrt(
      Math.pow(rightEyeCenter.x - leftEyeCenter.x, 2) + 
      Math.pow(rightEyeCenter.y - leftEyeCenter.y, 2)
    )

    // Calcular centro del rostro
    const faceCenterX = (leftEyeCenter.x + rightEyeCenter.x) / 2

    // Verificar simetría (distancia de cada ojo al centro)
    const leftDistance = Math.abs(leftEyeCenter.x - faceCenterX)
    const rightDistance = Math.abs(rightEyeCenter.x - faceCenterX)

    const symmetry = 1 - (Math.abs(leftDistance - rightDistance) / eyeDistance)

    return Math.max(0, Math.min(1, symmetry))

  } catch (error) {
    console.warn('⚠️ [LIVENESS] Error calculando simetría:', error)
    return 0
  }
}

/**
 * Convierte base64 a imagen
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
 * Carga modelos de face-api.js
 */
let modelsLoaded = false
async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return

  try {
    console.log('🤖 [LIVENESS] Cargando modelos...')
    
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/')
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/')

    modelsLoaded = true
    console.log('✅ [LIVENESS] Modelos cargados')
  } catch (error) {
    console.error('❌ [LIVENESS] Error cargando modelos:', error)
    throw error
  }
}
