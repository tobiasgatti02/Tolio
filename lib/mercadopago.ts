import { MercadoPagoConfig, Preference, Payment as MPPayment } from 'mercadopago'

// Función para obtener el cliente de MercadoPago de forma dinámica
function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN_SANDBOX
  const environment = process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox'

  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN_SANDBOX environment variable is not set')
  }

  return new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: 5000,
      idempotencyKey: 'abc'
    }
  })
}

// Funciones para obtener las APIs cuando se necesiten
function getPreferenceApi() {
  return new Preference(getMercadoPagoClient())
}

function getPaymentApi() {
  return new MPPayment(getMercadoPagoClient())
}

// Configuración de URLs
export const paymentConfig = {
  successUrl: process.env.MERCADOPAGO_SUCCESS_URL || 'http://localhost:3000/payment/success',
  failureUrl: process.env.MERCADOPAGO_FAILURE_URL || 'http://localhost:3000/payment/failure',
  pendingUrl: process.env.MERCADOPAGO_PENDING_URL || 'http://localhost:3000/payment/pending',
  webhookUrl: process.env.MERCADOPAGO_WEBHOOK_URL || 'http://localhost:3000/api/webhooks/mercadopago',
  environment: process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox',
  publicKey: process.env.MERCADOPAGO_PUBLIC_KEY_SANDBOX
}

// Función para crear una preferencia de pago
export async function createPaymentPreference(data: {
  id: string;
  title: string;
  price: number;
  quantity: number;
  bookingId: string;
}) {
  try {
    const preferenceApi = getPreferenceApi();
    
    const preferenceData = {
      items: [
        {
          id: data.id,
          title: data.title,
          unit_price: data.price,
          quantity: data.quantity
        }
      ],
      external_reference: data.bookingId,
      back_urls: {
        success: paymentConfig.successUrl,
        failure: paymentConfig.failureUrl,
        pending: paymentConfig.pendingUrl
      },
      auto_return: "approved",
      notification_url: paymentConfig.webhookUrl,
      statement_descriptor: "PRESTAR",
      payment_methods: {
        excluded_payment_types: [
          { id: "ticket" }
        ],
        installments: 12
      }
    }

    const response = await preferenceApi.create({ body: preferenceData })
    return response
  } catch (error) {
    console.error('Error creating payment preference:', error)
    throw error
  }
}

// Función para obtener información de un pago
export async function getPaymentInfo(paymentId: string) {
  try {
    const paymentApi = getPaymentApi();
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
