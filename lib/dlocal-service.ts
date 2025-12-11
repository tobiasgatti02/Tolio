import crypto from 'crypto'

/**
 * DLocal Go Service - Wrapper para DLocal Go API
 * 
 * Documentación: https://docs.dlocalgo.com/integration-api/
 * 
 * Este servicio maneja:
 * - Pagos con redirección a checkout de DLocal
 * - Webhooks de DLocal
 */

interface DLocalConfig {
    apiUrl: string
    apiKey: string
    secretKey: string
}

interface MaterialPaymentParams {
    bookingId: string
    providerId: string
    amount: number
    materials: Array<{ name: string; price: number }>
    clientEmail: string
    clientName: string
    currency?: string
}

interface ServicePaymentParams {
    bookingId: string
    providerId: string
    serviceAmount: number
    materialsAmount: number
    platformFeePercentage: number
    clientEmail: string
    clientName: string
    currency?: string
}

interface DLocalPayment {
    id: string
    amount: number
    currency: string
    status: string
    redirect_url?: string
    order_id: string
}

interface DLocalWebhook {
    id: string
    type: string
    data: {
        id: string
        status: string
        amount: number
        currency: string
        order_id: string
        [key: string]: any
    }
}

export class DLocalService {
    private config: DLocalConfig
    private isTestMode: boolean

    constructor() {
        // Usar credenciales de test si están disponibles, sino usar producción
        const hasTestCredentials = !!(process.env.DLOCAL_API_KEY_TEST && process.env.DLOCAL_SECRET_KEY_TEST)
        this.isTestMode = hasTestCredentials || process.env.NODE_ENV !== 'production'
        
        if (this.isTestMode && hasTestCredentials) {
            this.config = {
                apiUrl: process.env.DLOCAL_API_URL_TEST?.replace(/\/$/, '') || 'https://api-sbx.dlocalgo.com',
                apiKey: process.env.DLOCAL_API_KEY_TEST || '',
                secretKey: process.env.DLOCAL_SECRET_KEY_TEST || '',
            }
        } else {
            this.config = {
                apiUrl: process.env.DLOCAL_API_URL?.replace(/\/$/, '') || 'https://api.dlocalgo.com',
                apiKey: process.env.DLOCAL_API_KEY || '',
                secretKey: process.env.DLOCAL_SECRET_KEY || '',
            }
        }

        if (!this.config.apiKey || !this.config.secretKey) {
            console.warn('⚠️  DLocal credentials not configured. Payment features will not work.')
        } else {
            console.log(`🔧 DLocal initialized in ${this.isTestMode ? 'SANDBOX' : 'PRODUCTION'} mode`)
            console.log(`📍 API URL: ${this.config.apiUrl}`)
        }
    }

    /**
     * Realiza un request a la API de DLocal Go
     */
    private async request(
        endpoint: string,
        method: 'GET' | 'POST' = 'POST',
        body?: any
    ): Promise<any> {
        const url = `${this.config.apiUrl}${endpoint}`
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}:${this.config.secretKey}`,
        }

        console.log(`📤 DLocal Request: ${method} ${url}`)

        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        })

        const data = await response.json().catch(() => ({}))
        
        if (!response.ok) {
            console.error('❌ DLocal API Error:', response.status, data)
            throw new Error(`DLocal API Error: ${response.status} - ${JSON.stringify(data)}`)
        }

        console.log(`📥 DLocal Response:`, data)
        return data
    }

    /**
     * Crea un pago de materiales usando DLocal Go
     * Retorna redirect_url para que el usuario pague en el checkout de DLocal
     */
    async createMaterialPayment(params: MaterialPaymentParams): Promise<DLocalPayment> {
        const {
            bookingId,
            providerId,
            amount,
            materials,
            clientEmail,
            clientName,
            currency = 'ARS',
        } = params

        const orderId = `MAT-${bookingId}-${Date.now()}`
        const materialsDescription = materials.map(m => m.name).join(', ')

        const payload = {
            amount: amount,
            currency: currency,
            country: 'AR',
            order_id: orderId,
            description: `Materiales: ${materialsDescription}`.substring(0, 200),
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${bookingId}?payment=success&type=material`,
            back_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${bookingId}?payment=cancelled`,
            notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
            payer: {
                name: clientName,
                email: clientEmail,
            },
        }

        console.log('💳 Creating DLocal material payment:', payload)

        const response = await this.request('/v1/payments', 'POST', payload)
        
        return {
            id: response.id,
            amount: response.amount,
            currency: response.currency,
            status: response.status,
            redirect_url: response.redirect_url,
            order_id: response.order_id,
        }
    }

    /**
     * Crea un pago de servicio usando DLocal Go
     */
    async createServicePayment(params: ServicePaymentParams): Promise<DLocalPayment> {
        const {
            bookingId,
            providerId,
            serviceAmount,
            materialsAmount,
            platformFeePercentage,
            clientEmail,
            clientName,
            currency = 'ARS',
        } = params

        const orderId = `SRV-${bookingId}-${Date.now()}`
        const totalAmount = serviceAmount + materialsAmount

        const payload = {
            amount: totalAmount,
            currency: currency,
            country: 'AR',
            order_id: orderId,
            description: `Pago de servicio - Reserva`,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${bookingId}?payment=success&type=service`,
            back_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${bookingId}?payment=cancelled`,
            notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
            payer: {
                name: clientName,
                email: clientEmail,
            },
        }

        console.log('💳 Creating DLocal service payment:', payload)

        const response = await this.request('/v1/payments', 'POST', payload)
        
        return {
            id: response.id,
            amount: response.amount,
            currency: response.currency,
            status: response.status,
            redirect_url: response.redirect_url,
            order_id: response.order_id,
        }
    }

    /**
     * Obtiene el estado de un pago
     */
    async getPaymentStatus(paymentId: string): Promise<any> {
        return this.request(`/v1/payments/${paymentId}`, 'GET')
    }

    /**
     * Verifica la firma de un webhook (para validar que viene de DLocal)
     */
    verifyWebhookSignature(signature: string, body: string): boolean {
        const expectedSignature = crypto
            .createHmac('sha256', this.config.secretKey)
            .update(body)
            .digest('hex')
        return signature === expectedSignature
    }

    /**
     * Procesa un webhook de DLocal
     */
    async processWebhook(payload: DLocalWebhook): Promise<{
        paymentId: string
        status: string
        bookingId?: string
        paymentType?: string
    }> {
        const { id, type, data } = payload

        // Extraer bookingId del order_id
        // Formato: MAT-{bookingId}-{timestamp} o SRV-{bookingId}-{timestamp}
        const parts = data.order_id?.split('-') || []
        const paymentType = parts[0] === 'MAT' ? 'MATERIAL' : 'SERVICE'
        // El bookingId es un UUID con formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        const bookingId = parts.length >= 6 ? parts.slice(1, 6).join('-') : undefined

        return {
            paymentId: data.id,
            status: data.status,
            bookingId,
            paymentType,
        }
    }
}

// Singleton instance
export const dlocalService = new DLocalService()
