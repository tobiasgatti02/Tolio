/**
 * Camera Service - Manejo inteligente de selección de cámaras
 * Arquitectura limpia: Servicio dedicado para lógica de cámara
 */

export interface CameraDevice {
  deviceId: string
  label: string
  facingMode: 'user' | 'environment'
}

export interface CameraCapabilities {
  hasFrontCamera: boolean
  hasBackCamera: boolean
  recommendedCamera: 'user' | 'environment'
}

export class CameraService {
  private static instance: CameraService

  private constructor() {}

  static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService()
    }
    return CameraService.instance
  }

  /**
   * Detecta si el dispositivo es móvil
   */
  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768
  }

  /**
   * Obtiene todas las cámaras disponibles
   */
  async getAvailableCameras(): Promise<CameraDevice[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')

      return videoDevices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
        facingMode: this.inferFacingMode(device.label)
      }))
    } catch (error) {
      console.error('❌ [CAMERA-SERVICE] Error obteniendo cámaras:', error)
      return []
    }
  }

  /**
   * Infere el facing mode basado en el label del dispositivo
   */
  private inferFacingMode(label: string): 'user' | 'environment' {
    const lowerLabel = label.toLowerCase()
    if (lowerLabel.includes('front') || lowerLabel.includes('user') || lowerLabel.includes('facial')) {
      return 'user'
    }
    if (lowerLabel.includes('back') || lowerLabel.includes('environment') || lowerLabel.includes('world')) {
      return 'environment'
    }
    // Default: asumir que la primera es frontal en móviles, trasera en desktop
    return this.isMobileDevice() ? 'user' : 'environment'
  }

  /**
   * Obtiene las capacidades de cámara del dispositivo
   */
  async getCameraCapabilities(): Promise<CameraCapabilities> {
    const cameras = await this.getAvailableCameras()

    const hasFrontCamera = cameras.some(cam => cam.facingMode === 'user')
    const hasBackCamera = cameras.some(cam => cam.facingMode === 'environment')

    // Lógica de recomendación inteligente
    const recommendedCamera = this.isMobileDevice() ? 'user' : 'environment'

    return {
      hasFrontCamera,
      hasBackCamera,
      recommendedCamera
    }
  }

  /**
   * Obtiene las constraints óptimas para la cámara recomendada
   */
  async getOptimalConstraints(): Promise<MediaStreamConstraints> {
    const capabilities = await this.getCameraCapabilities()
    const cameras = await this.getAvailableCameras()

    const recommendedDevice = cameras.find(cam => cam.facingMode === capabilities.recommendedCamera)

    return {
      video: {
        deviceId: recommendedDevice?.deviceId ? { exact: recommendedDevice.deviceId } : undefined,
        facingMode: capabilities.recommendedCamera,
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 },
        frameRate: { ideal: 30, min: 15 }
      },
      audio: false
    }
  }

  /**
   * Solicita acceso a la cámara con constraints óptimos
   */
  async requestCameraAccess(): Promise<MediaStream> {
    try {
      const constraints = await this.getOptimalConstraints()
      console.log('📹 [CAMERA-SERVICE] Solicitando acceso con constraints:', constraints)

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('✅ [CAMERA-SERVICE] Acceso concedido')

      return stream
    } catch (error) {
      console.error('❌ [CAMERA-SERVICE] Error accediendo a cámara:', error)

      // Fallback: intentar con constraints básicas
      try {
        console.log('🔄 [CAMERA-SERVICE] Intentando fallback...')
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        })
        console.log('✅ [CAMERA-SERVICE] Fallback exitoso')
        return fallbackStream
      } catch (fallbackError) {
        console.error('❌ [CAMERA-SERVICE] Fallback falló:', fallbackError)
        throw new Error('No se pudo acceder a la cámara')
      }
    }
  }

  /**
   * Libera el stream de la cámara
   */
  stopStream(stream: MediaStream): void {
    stream.getTracks().forEach(track => track.stop())
    console.log('🛑 [CAMERA-SERVICE] Stream detenido')
  }
}