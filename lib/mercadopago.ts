import { MercadoPagoConfig, Preference, Payment as MPPayment } from 'mercadopago'

// Configuración de MercadoPago
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN_SANDBOX
const environment = process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox'

if (!accessToken) {
  throw new Error('MERCADOPAGO_ACCESS_TOKEN_SANDBOX environment variable is not set')
}

// Inicializar cliente de MercadoPago
const client = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
})

// Instanciar APIs
export const preferenceApi = new Preference(client)
export const paymentApi = new MPPayment(client)

// Configuración de URLs
export const paymentConfig = {
  successUrl: process.env.MERCADOPAGO_SUCCESS_URL || 'http://localhost:3000/payment/success',
  failureUrl: process.env.MERCADOPAGO_FAILURE_URL || 'http://localhost:3000/payment/failure',
  pendingUrl: process.env.MERCADOPAGO_PENDING_URL || 'http://localhost:3000/payment/pending',
  webhookUrl: process.env.MERCADOPAGO_WEBHOOK_URL || 'http://localhost:3000/api/webhooks/mercadopago',
  environment,
  publicKey: process.env.MERCADOPAGO_PUBLIC_KEY_SANDBOX
}

// Función para crear una preferencia de pago
export async function createPaymentPreference({
  bookingId,
  amount,
  title,
  description,
  userEmail,
  userName
}: {
  bookingId: string
  amount: number
  title: string
  description: string
  userEmail: string
  userName: string
}) {
  try {
    const preferenceData = {
      items: [
        {
          id: bookingId,
          title,
          description,
          quantity: 1,
          unit_price: amount,
          currency_id: 'ARS'
        }
      ],
      back_urls: {
        success: `${paymentConfig.successUrl}?booking_id=${bookingId}`,
        failure: `${paymentConfig.failureUrl}?booking_id=${bookingId}`,
        pending: `${paymentConfig.pendingUrl}?booking_id=${bookingId}`
      },
      auto_return: 'approved',
      external_reference: bookingId
    }

    const preference = await preferenceApi.create({ body: preferenceData })
    
    if (!preference.id) {
      throw new Error('Failed to create payment preference')
    }

    return {
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point
    }
  } catch (error) {
    console.error('Error creating payment preference:', error)
    throw error
  }
}

// Función para obtener información de un pago
export async function getPaymentInfo(paymentId: string) {
  try {
    const payment = await paymentApi.get({ id: paymentId })
    return payment
  } catch (error) {
    console.error('Error getting payment info:', error)
    throw error
  }
}

// Función para verificar el estado de un pago
export function getPaymentStatus(status: string, statusDetail: string) {
  const statusMap: { [key: string]: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' } = {
    approved: 'COMPLETED',
    pending: 'PENDING',
    authorized: 'PENDING',
    in_process: 'PENDING',
    in_mediation: 'PENDING',
    rejected: 'FAILED',
    cancelled: 'FAILED',
    refunded: 'REFUNDED',
    charged_back: 'REFUNDED'
  }

  return statusMap[status] || 'PENDING'
}

export default client
