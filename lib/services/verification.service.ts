/**
 * Verification Service - Servicio principal de orquestación
 * Arquitectura limpia: Fachada que coordina todos los servicios
 */

import { CameraService } from './camera.service'
import { LivenessService } from './liveness.service'
import { FaceMatchingService } from './face-matching.service'
import { DNIService, DNIData } from './dni.service'

export interface VerificationStep {
  id: string
  name: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  data?: any
  error?: string
}

export interface VerificationResult {
  success: boolean
  dniData?: DNIData
  faceMatchScore?: number
  steps: VerificationStep[]
  error?: string
}

export interface VerificationConfig {
  livenessDuration: number
  faceMatchThreshold: number
  enableDebugLogs: boolean
}

export class VerificationService {
  private static instance: VerificationService

  private cameraService = CameraService.getInstance()
  private livenessService = LivenessService.getInstance()
  private faceMatchingService = FaceMatchingService.getInstance()
  private dniService = DNIService.getInstance()

  private currentSteps: VerificationStep[] = []
  private config: VerificationConfig

  private constructor(config: Partial<VerificationConfig> = {}) {
    this.config = {
      livenessDuration: 2000,
      faceMatchThreshold: 0.8,
      enableDebugLogs: true,
      ...config
    }
  }

  static getInstance(config?: Partial<VerificationConfig>): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService(config)
    }
    return VerificationService.instance
  }

  /**
   * Inicia el proceso completo de verificación
   */
  async startVerification(): Promise<VerificationResult> {
    console.log('🚀 [VERIFICATION-SERVICE] Iniciando proceso de verificación...')

    this.currentSteps = [
      { id: 'camera-access', name: 'Acceso a Cámara', status: 'pending' },
      { id: 'liveness', name: 'Detección de Liveness', status: 'pending' },
      { id: 'dni-front', name: 'Foto Frente DNI', status: 'pending' },
      { id: 'dni-back', name: 'Foto Dorso DNI', status: 'pending' },
      { id: 'face-matching', name: 'Comparación Facial', status: 'pending' },
      { id: 'validation', name: 'Validación Final', status: 'pending' }
    ]

    try {
      // Paso 1: Verificar acceso a cámara
      await this.verifyCameraAccess()

      // Paso 2: Realizar liveness detection
      await this.performLivenessDetection()

      // Paso 3: Capturar frente del DNI
      const frontResult = await this.captureDNIFront()

      // Paso 4: Capturar dorso del DNI
      const backResult = await this.captureDNIBack()

      // Paso 5: Realizar face matching
      const matchResult = await this.performFaceMatching(frontResult.faceImage!, backResult.pdf417Data)

      // Paso 6: Validación final
      const finalResult = await this.finalValidation(matchResult, backResult.dniData)

      console.log('✅ [VERIFICATION-SERVICE] Verificación completada exitosamente')

      return {
        success: true,
        dniData: finalResult.dniData,
        faceMatchScore: finalResult.faceMatchScore,
        steps: this.currentSteps
      }

    } catch (error) {
      console.error('❌ [VERIFICATION-SERVICE] Error en verificación:', error)

      // Marcar paso fallido
      const currentStep = this.currentSteps.find(step => step.status === 'in-progress')
      if (currentStep) {
        currentStep.status = 'failed'
        currentStep.error = error instanceof Error ? error.message : 'Error desconocido'
      }

      return {
        success: false,
        steps: this.currentSteps,
        error: error instanceof Error ? error.message : 'Error en verificación'
      }
    }
  }

  /**
   * Verifica acceso a la cámara
   */
  private async verifyCameraAccess(): Promise<void> {
    this.updateStepStatus('camera-access', 'in-progress')

    try {
      const capabilities = await this.cameraService.getCameraCapabilities()

      if (!capabilities.hasFrontCamera && !capabilities.hasBackCamera) {
        throw new Error('No se detectaron cámaras disponibles')
      }

      // Intentar acceder a la cámara recomendada
      const stream = await this.cameraService.requestCameraAccess()
      this.cameraService.stopStream(stream) // Liberar inmediatamente

      this.updateStepStatus('camera-access', 'completed')
      console.log('✅ [VERIFICATION-SERVICE] Acceso a cámara verificado')

    } catch (error) {
      this.updateStepStatus('camera-access', 'failed', error instanceof Error ? error.message : 'Error de acceso')
      throw error
    }
  }

  /**
   * Realiza detección de liveness
   */
  private async performLivenessDetection(): Promise<void> {
    this.updateStepStatus('liveness', 'in-progress')

    try {
      // Nota: Este método será llamado desde el componente React
      // con el video element como parámetro
      console.log('⏳ [VERIFICATION-SERVICE] Liveness detection preparado')

      // Por ahora, marcamos como completado (se hará en el componente)
      this.updateStepStatus('liveness', 'completed')

    } catch (error) {
      this.updateStepStatus('liveness', 'failed', error instanceof Error ? error.message : 'Error en liveness')
      throw error
    }
  }

  /**
   * Captura frente del DNI
   */
  private async captureDNIFront(): Promise<{ faceImage: string }> {
    this.updateStepStatus('dni-front', 'in-progress')

    try {
      // Este método será llamado desde el componente React
      // con la imagen capturada como parámetro
      console.log('⏳ [VERIFICATION-SERVICE] Captura de frente del DNI preparada')

      // Placeholder - se implementará en el componente
      throw new Error('Método debe ser llamado desde componente React')

    } catch (error) {
      this.updateStepStatus('dni-front', 'failed', error instanceof Error ? error.message : 'Error capturando frente')
      throw error
    }
  }

  /**
   * Captura dorso del DNI
   */
  private async captureDNIBack(): Promise<{ pdf417Data: any; dniData: DNIData }> {
    this.updateStepStatus('dni-back', 'in-progress')

    try {
      // Este método será llamado desde el componente React
      console.log('⏳ [VERIFICATION-SERVICE] Captura de dorso del DNI preparada')

      // Placeholder - se implementará en el componente
      throw new Error('Método debe ser llamado desde componente React')

    } catch (error) {
      this.updateStepStatus('dni-back', 'failed', error instanceof Error ? error.message : 'Error capturando dorso')
      throw error
    }
  }

  /**
   * Realiza comparación facial
   */
  private async performFaceMatching(faceImage: string, pdf417Data: any): Promise<{ isMatch: boolean; score: number; dniData: DNIData }> {
    this.updateStepStatus('face-matching', 'in-progress')

    try {
      // Extraer datos del DNI
      const dniData = this.dniService.processBackData(pdf417Data)

      // Validar datos del DNI
      const validation = this.dniService.validateDNIData(dniData)
      if (!validation.isValid) {
        throw new Error(`Datos del DNI inválidos: ${validation.errors.join(', ')}`)
      }

      // Nota: La comparación facial real se hará con el video de liveness
      // Este método es un placeholder para la lógica de comparación
      console.log('⏳ [VERIFICATION-SERVICE] Face matching preparado')

      this.updateStepStatus('face-matching', 'completed', { dniData })

      return {
        isMatch: true, // Placeholder
        score: 0.9,   // Placeholder
        dniData
      }

    } catch (error) {
      this.updateStepStatus('face-matching', 'failed', error instanceof Error ? error.message : 'Error en comparación facial')
      throw error
    }
  }

  /**
   * Validación final
   */
  private async finalValidation(matchResult: any, dniData: DNIData): Promise<{ dniData: DNIData; faceMatchScore: number }> {
    this.updateStepStatus('validation', 'in-progress')

    try {
      // Validaciones finales
      if (!matchResult.isMatch) {
        throw new Error('La comparación facial no fue exitosa')
      }

      if (matchResult.score < this.config.faceMatchThreshold) {
        throw new Error(`Score de similitud insuficiente: ${(matchResult.score * 100).toFixed(1)}%`)
      }

      this.updateStepStatus('validation', 'completed')

      return {
        dniData,
        faceMatchScore: matchResult.score
      }

    } catch (error) {
      this.updateStepStatus('validation', 'failed', error instanceof Error ? error.message : 'Error en validación final')
      throw error
    }
  }

  /**
   * Método público para comparar rostro del video con cara del DNI
   */
  async compareLiveFaceWithDNI(videoImage: string, dniFaceImage: string): Promise<{ isMatch: boolean; score: number }> {
    console.log('🔍 [VERIFICATION-SERVICE] Iniciando comparación facial entre video y DNI')
    console.log('📊 [VERIFICATION-SERVICE] Datos de entrada:', {
      hasVideoImage: !!videoImage,
      videoImageLength: videoImage?.length || 0,
      hasDniFaceImage: !!dniFaceImage,
      dniFaceImageLength: dniFaceImage?.length || 0,
      threshold: this.config.faceMatchThreshold
    })

    try {
      const result = await this.faceMatchingService.compareImages(videoImage, dniFaceImage, this.config.faceMatchThreshold)

      console.log('📊 [VERIFICATION-SERVICE] Resultado de comparación facial:', {
        isMatch: result.isMatch,
        confidence: result.confidence,
        similarity: result.similarity,
        hasError: !!result.error,
        error: result.error
      })

      if (result.error) {
        console.error('❌ [VERIFICATION-SERVICE] Error en comparación facial:', result.error)
      }

      return {
        isMatch: result.isMatch,
        score: result.confidence
      }
    } catch (error) {
      console.error('❌ [VERIFICATION-SERVICE] Error en comparación live:', error)
      console.error('❌ [VERIFICATION-SERVICE] Detalles del error:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      })
      return {
        isMatch: false,
        score: 0
      }
    }
  }

  /**
   * Método público para procesar frente del DNI
   */
  async processDNIFrontImage(imageData: string): Promise<{ faceImage?: string; error?: string }> {
    return await this.dniService.processFrontImage(imageData)
  }

  /**
   * Método público para procesar dorso del DNI
   */
  async processDNIBackData(pdf417Data: any): Promise<DNIData> {
    return this.dniService.processBackData(pdf417Data)
  }

  /**
   * Actualiza el estado de un paso
   */
  private updateStepStatus(stepId: string, status: VerificationStep['status'], data?: any, error?: string): void {
    const step = this.currentSteps.find(s => s.id === stepId)
    if (step) {
      step.status = status
      if (data) step.data = data
      if (error) step.error = error

      if (this.config.enableDebugLogs) {
        console.log(`📋 [VERIFICATION-SERVICE] Paso ${stepId}: ${status}`, data || error || '')
      }
    }
  }

  /**
   * Obtiene el estado actual de los pasos
   */
  getCurrentSteps(): VerificationStep[] {
    return [...this.currentSteps]
  }

  /**
   * Resetea el estado de verificación
   */
  reset(): void {
    this.currentSteps = []
    console.log('🔄 [VERIFICATION-SERVICE] Estado reseteado')
  }
}