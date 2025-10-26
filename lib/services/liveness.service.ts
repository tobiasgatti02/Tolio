/**
 * Liveness Service - Detección de movimiento de cabeza para verificar humanos
 * Arquitectura limpia: Servicio especializado en liveness detection
 */

import * as faceapi from 'face-api.js'

export interface LivenessResult {
  isLive: boolean
  confidence: number
  movementDetected: boolean
  error?: string
}

export interface LivenessConfig {
  movementThreshold: number // grados mínimos de movimiento
  duration: number // segundos que debe durar el movimiento
  requiredDirection: 'left' | 'right' | 'both'
}

export class LivenessService {
  private static instance: LivenessService
  private modelsLoaded = false

  private constructor() {}

  static getInstance(): LivenessService {
    if (!LivenessService.instance) {
      LivenessService.instance = new LivenessService()
    }
    return LivenessService.instance
  }

  /**
   * Carga los modelos necesarios para liveness
   */
  private async loadModels(): Promise<void> {
    if (this.modelsLoaded) return

    try {
      console.log('🤖 [LIVENESS-SERVICE] Cargando modelos...')

      await faceapi.nets.tinyFaceDetector.loadFromUri('https://unpkg.com/face-api.js@0.22.2/weights/')
      await faceapi.nets.faceLandmark68Net.loadFromUri('https://unpkg.com/face-api.js@0.22.2/weights/')

      this.modelsLoaded = true
      console.log('✅ [LIVENESS-SERVICE] Modelos cargados')
    } catch (error) {
      console.error('❌ [LIVENESS-SERVICE] Error cargando modelos:', error)
      throw error
    }
  }

  /**
   * Detecta movimiento de cabeza en un video stream
   */
  async detectHeadMovement(
    videoElement: HTMLVideoElement,
    config: LivenessConfig = {
      movementThreshold: 15, // 15 grados
      duration: 2, // 2 segundos
      requiredDirection: 'both' // izquierda y derecha
    }
  ): Promise<LivenessResult> {
    await this.loadModels()

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = videoElement.videoWidth
      canvas.height = videoElement.videoHeight

      let startTime = Date.now()
      let initialYaw = 0
      let maxLeftYaw = 0
      let maxRightYaw = 0
      let movementDetected = false
      let leftMovement = false
      let rightMovement = false

      const analyzeFrame = async () => {
        try {
          // Capturar frame del video
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

          // Detectar rostro y landmarks
          const detection = await faceapi
            .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()

          if (!detection) {
            console.warn('⚠️ [LIVENESS-SERVICE] No se detectó rostro')
            requestAnimationFrame(analyzeFrame)
            return
          }

          // Calcular ángulo de yaw (rotación horizontal)
          const yaw = this.calculateYawAngle(detection.landmarks)

          // Inicializar posición inicial
          if (initialYaw === 0) {
            initialYaw = yaw
            console.log('📍 [LIVENESS-SERVICE] Posición inicial:', yaw.toFixed(2))
          }

          // Trackear movimiento máximo
          const relativeYaw = yaw - initialYaw
          maxLeftYaw = Math.min(maxLeftYaw, relativeYaw)
          maxRightYaw = Math.max(maxRightYaw, relativeYaw)

          // Detectar movimientos
          if (relativeYaw < -config.movementThreshold) {
            leftMovement = true
            console.log('⬅️ [LIVENESS-SERVICE] Movimiento izquierda detectado:', relativeYaw.toFixed(2))
          }
          if (relativeYaw > config.movementThreshold) {
            rightMovement = true
            console.log('➡️ [LIVENESS-SERVICE] Movimiento derecha detectado:', relativeYaw.toFixed(2))
          }

          // Verificar si se completó el movimiento requerido
          const requiredMovements = config.requiredDirection === 'both' ? (leftMovement && rightMovement) : (leftMovement || rightMovement)
          const timeElapsed = (Date.now() - startTime) / 1000

          if (requiredMovements && timeElapsed >= config.duration) {
            movementDetected = true
            console.log('✅ [LIVENESS-SERVICE] Liveness completado')

            resolve({
              isLive: true,
              confidence: 0.95,
              movementDetected: true
            })
            return
          }

          // Timeout después de 10 segundos
          if (timeElapsed > 10) {
            console.log('⏰ [LIVENESS-SERVICE] Timeout alcanzado')

            resolve({
              isLive: false,
              confidence: 0.1,
              movementDetected: false,
              error: 'Timeout: movimiento insuficiente'
            })
            return
          }

          requestAnimationFrame(analyzeFrame)

        } catch (error) {
          console.error('❌ [LIVENESS-SERVICE] Error analizando frame:', error)
          reject(error)
        }
      }

      // Iniciar análisis
      console.log('🎬 [LIVENESS-SERVICE] Iniciando análisis de liveness...')
      analyzeFrame()
    })
  }

  /**
   * Calcula el ángulo de yaw basado en landmarks faciales
   * Usa la distancia entre ojos para estimar rotación
   */
  private calculateYawAngle(landmarks: faceapi.FaceLandmarks68): number {
    const leftEye = landmarks.getLeftEye()
    const rightEye = landmarks.getRightEye()

    // Centro de cada ojo
    const leftEyeCenter = {
      x: leftEye.reduce((sum, point) => sum + point.x, 0) / leftEye.length,
      y: leftEye.reduce((sum, point) => sum + point.y, 0) / leftEye.length
    }

    const rightEyeCenter = {
      x: rightEye.reduce((sum, point) => sum + point.x, 0) / rightEye.length,
      y: rightEye.reduce((sum, point) => sum + point.y, 0) / rightEye.length
    }

    // Calcular ángulo basado en la línea entre ojos
    const deltaX = rightEyeCenter.x - leftEyeCenter.x
    const deltaY = rightEyeCenter.y - leftEyeCenter.y

    // Ángulo en grados (0 = mirando al frente)
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)

    return angle
  }

  /**
   * Método simplificado para testing
   */
  async mockLivenessDetection(duration: number = 2000): Promise<LivenessResult> {
    console.log('🎭 [LIVENESS-SERVICE] Simulando liveness detection...')

    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          isLive: true,
          confidence: 0.9,
          movementDetected: true
        })
      }, duration)
    })
  }
}