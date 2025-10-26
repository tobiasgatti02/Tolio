/**
 * DNI Service - Procesamiento inteligente de documentos de identidad
 * Arquitectura limpia: Servicio especializado en procesamiento de DNI
 */

import * as faceapi from 'face-api.js'

export interface DNIData {
  documentNumber: string
  firstName: string
  lastName: string
  birthDate: string
  gender: string
  expirationDate: string
  fullName: string
  rawData: string
}

export interface DNIProcessingResult {
  success: boolean
  data?: DNIData
  faceImage?: string // Base64 de la cara extraída
  error?: string
}

export interface DNIImageAnalysis {
  hasFace: boolean
  faceBounds?: faceapi.Box
  textDetected: boolean
  quality: 'good' | 'medium' | 'poor'
}

export class DNIService {
  private static instance: DNIService
  private modelsLoaded = false

  private constructor() {}

  static getInstance(): DNIService {
    if (!DNIService.instance) {
      DNIService.instance = new DNIService()
    }
    return DNIService.instance
  }

  /**
   * Carga modelos necesarios para procesamiento de DNI
   */
  private async loadModels(): Promise<void> {
    if (this.modelsLoaded) return

    try {
      console.log('🤖 [DNI-SERVICE] Cargando modelos...')

      await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/')

      this.modelsLoaded = true
      console.log('✅ [DNI-SERVICE] Modelos cargados')
    } catch (error) {
      console.error('❌ [DNI-SERVICE] Error cargando modelos:', error)
      throw error
    }
  }

  /**
   * Procesa imagen del frente del DNI para extraer la cara
   */
  async processFrontImage(imageData: string): Promise<{ faceImage?: string; error?: string }> {
    await this.loadModels()

    try {
      console.log('🖼️ [DNI-SERVICE] Procesando frente del DNI...')

      const img = await this.base64ToImage(imageData)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Detectar rostro en la imagen del DNI
      const detection = await faceapi.detectSingleFace(
        canvas,
        new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
      )

      if (!detection) {
        return {
          error: 'No se detectó rostro en la imagen del frente del DNI'
        }
      }

      // Extraer la región del rostro con padding
      const padding = 20
      const { x, y, width, height } = detection.box
      const faceCanvas = document.createElement('canvas')
      const faceCtx = faceCanvas.getContext('2d')!

      const faceSize = Math.max(width, height) + (padding * 2)
      faceCanvas.width = faceSize
      faceCanvas.height = faceSize

      // Centrar el rostro en el canvas
      const centerX = faceSize / 2
      const centerY = faceSize / 2
      const sourceX = Math.max(0, x - padding)
      const sourceY = Math.max(0, y - padding)
      const sourceWidth = Math.min(width + (padding * 2), img.width - sourceX)
      const sourceHeight = Math.min(height + (padding * 2), img.height - sourceY)

      faceCtx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        centerX - (sourceWidth / 2), centerY - (sourceHeight / 2), sourceWidth, sourceHeight
      )

      const faceImage = faceCanvas.toDataURL('image/jpeg', 0.9)

      console.log('✅ [DNI-SERVICE] Cara extraída exitosamente del frente del DNI')

      return { faceImage }

    } catch (error) {
      console.error('❌ [DNI-SERVICE] Error procesando frente del DNI:', error)
      return {
        error: error instanceof Error ? error.message : 'Error procesando imagen'
      }
    }
  }

  /**
   * Procesa imagen del dorso del DNI para extraer datos PDF417
   * Nota: Esta función asume que los datos PDF417 ya fueron decodificados
   * por el componente de escaneo
   */
  processBackData(pdf417Data: any): DNIData {
    console.log('📄 [DNI-SERVICE] Procesando datos del dorso del DNI...')

    // Validar datos requeridos
    const requiredFields = ['documentNumber', 'firstName', 'lastName', 'birthDate']
    for (const field of requiredFields) {
      if (!pdf417Data[field]) {
        throw new Error(`Campo requerido faltante: ${field}`)
      }
    }

    const dniData: DNIData = {
      documentNumber: pdf417Data.documentNumber,
      firstName: pdf417Data.firstName,
      lastName: pdf417Data.lastName,
      birthDate: pdf417Data.birthDate,
      gender: pdf417Data.gender || 'N',
      expirationDate: pdf417Data.expirationDate || '',
      fullName: `${pdf417Data.firstName} ${pdf417Data.lastName}`,
      rawData: JSON.stringify(pdf417Data)
    }

    console.log('✅ [DNI-SERVICE] Datos del DNI procesados:', {
      documentNumber: dniData.documentNumber,
      fullName: dniData.fullName,
      birthDate: dniData.birthDate
    })

    return dniData
  }

  /**
   * Analiza la calidad de una imagen de DNI
   */
  async analyzeImageQuality(imageData: string): Promise<DNIImageAnalysis> {
    await this.loadModels()

    try {
      const img = await this.base64ToImage(imageData)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Detectar rostro
      const detection = await faceapi.detectSingleFace(
        canvas,
        new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 })
      )

      const hasFace = !!detection

      // Evaluar calidad general
      let quality: 'good' | 'medium' | 'poor' = 'poor'

      if (img.width >= 1000 && img.height >= 600) {
        quality = 'good'
      } else if (img.width >= 640 && img.height >= 480) {
        quality = 'medium'
      }

      // Si hay rostro pero calidad baja, bajar calificación
      if (hasFace && quality === 'good' && detection!.score < 0.7) {
        quality = 'medium'
      }

      return {
        hasFace,
        faceBounds: detection?.box,
        textDetected: true, // Asumimos que hay texto en DNI
        quality
      }

    } catch (error) {
      console.error('❌ [DNI-SERVICE] Error analizando calidad:', error)
      return {
        hasFace: false,
        textDetected: false,
        quality: 'poor'
      }
    }
  }

  /**
   * Valida datos del DNI
   */
  validateDNIData(data: DNIData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validar número de documento
    if (!/^\d{7,8}$/.test(data.documentNumber)) {
      errors.push('Número de documento inválido')
    }

    // Validar nombres
    if (data.firstName.length < 2 || data.lastName.length < 2) {
      errors.push('Nombres muy cortos')
    }

    // Validar fecha de nacimiento
    const birthDate = new Date(data.birthDate)
    const now = new Date()
    const age = now.getFullYear() - birthDate.getFullYear()

    if (isNaN(birthDate.getTime()) || age < 16 || age > 120) {
      errors.push('Fecha de nacimiento inválida')
    }

    // Validar género
    if (!['M', 'F', 'N'].includes(data.gender)) {
      errors.push('Género inválido')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
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
}