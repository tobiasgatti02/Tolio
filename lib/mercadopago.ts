import { MercadoPagoConfig, Preference, Payment as MPPayment, OAuth } from 'mercadopago'

// Función para obtener el cliente de MercadoPago principal (marketplace)
function getMarketplaceMercadoPagoClient() {
  const accessToken = process.env.MP_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error('MP_ACCESS_TOKEN not found. Please check your environment variables.')
  }

  return new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: 5000,
    }
  })
}

// Función para obtener cliente con access token específico (para vendedores)
function getMercadoPagoClientWithToken(accessToken: string) {
  return new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: 5000,
    }
  })
}

// Funciones para obtener las APIs cuando se necesiten
function getPreferenceApi(client?: MercadoPagoConfig) {
  return new Preference(client || getMarketplaceMercadoPagoClient())
}

function getPaymentApi(client?: MercadoPagoConfig) {
  return new MPPayment(client || getMarketplaceMercadoPagoClient())
}

function getOAuthApi() {
  return new OAuth(getMarketplaceMercadoPagoClient())
}

// Configuración de URLs
export const paymentConfig = {
  successUrl: process.env.MERCADOPAGO_SUCCESS_URL || process.env.APP_URL + '/payment/success',
  failureUrl: process.env.MERCADOPAGO_FAILURE_URL || process.env.APP_URL + '/payment/failure',
  pendingUrl: process.env.MERCADOPAGO_PENDING_URL || process.env.APP_URL + '/payment/pending',
  webhookUrl: process.env.MERCADOPAGO_WEBHOOK_URL || process.env.APP_URL + '/api/webhooks/mercadopago',
  environment: process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox',
  publicKey: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
  clientId: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
  appUrl: process.env.APP_URL,
  commissionPercentage: Number(process.env.MARKETPLACE_COMMISSION_PERCENTAGE) || 2
}

// Función para obtener URL de autorización OAuth
export async function getAuthorizationUrl(userId?: string) {
  try {
    const oAuthApi = getOAuthApi()
    const options: any = {
      client_id: paymentConfig.clientId!,
      redirect_uri: `${paymentConfig.appUrl}/api/mercadopago/connect`,
    }
    
    // Agregar state si se proporciona userId
    if (userId) {
      options.state = userId
    }
    
    const url = oAuthApi.getAuthorizationURL({ options })
    return url
  } catch (error) {
    console.error('Error getting authorization URL:', error)
    throw error
  }
}

// Función para intercambiar código por access token
export async function exchangeCodeForCredentials(code: string) {
  try {
    const oAuthApi = getOAuthApi()
    
    const requestBody = {
      client_id: paymentConfig.clientId!,
      client_secret: process.env.MP_CLIENT_SECRET!,
      code,
      redirect_uri: `${paymentConfig.appUrl}/api/mercadopago/connect`,
    }
    
    console.log('🔑 OAuth Request Details:')
    console.log('- client_id:', requestBody.client_id)
    console.log('- client_secret:', requestBody.client_secret ? '***PROVIDED***' : 'MISSING')
    console.log('- redirect_uri:', requestBody.redirect_uri)
    console.log('- code:', code ? '***PROVIDED***' : 'MISSING')
    
    const credentials = await oAuthApi.create({
      body: requestBody,
    })
    return credentials
  } catch (error) {
    console.error('Error exchanging code for token:', error)
    throw error
  }
}

// Función para crear una preferencia de pago marketplace
export async function createMarketplacePaymentPreference(data: {
  bookingId: string;
  amount: number;
  title: string;
  description: string;
  userEmail: string;
  userName: string;
  ownerAccessToken: string; // Access token del propietario del item
}) {
  try {
    // Usamos el access token del propietario para crear la preferencia
    const ownerClient = getMercadoPagoClientWithToken(data.ownerAccessToken)
    const preferenceApi = getPreferenceApi(ownerClient)
    
    // Calcular comisión del marketplace
    const marketplaceFee = Math.round(data.amount * (paymentConfig.commissionPercentage / 100))
    
    const preferenceData = {
      items: [
        {
          id: data.bookingId,
          title: data.title,
          description: data.description,
          unit_price: data.amount,
          quantity: 1,
          currency_id: "ARS"
        }
      ],
      payer: {
        name: data.userName,
        email: data.userEmail
      },
      external_reference: data.bookingId,
      back_urls: {
        success: `${paymentConfig.successUrl}?external_reference=${data.bookingId}`,
        failure: `${paymentConfig.failureUrl}?external_reference=${data.bookingId}`,
        pending: `${paymentConfig.pendingUrl}?external_reference=${data.bookingId}`
      },
      notification_url: paymentConfig.webhookUrl,
      statement_descriptor: "PRESTAR",
      payment_methods: {
        excluded_payment_types: [
          { id: "ticket" }
        ],
        installments: 12
      },
      // Comisión del marketplace
      marketplace_fee: marketplaceFee,
      // Metadata para identificar el marketplace
      metadata: {
        booking_id: data.bookingId,
        marketplace: "prestar",
        commission_percentage: paymentConfig.commissionPercentage,
        marketplace_fee: marketplaceFee,
        owner_amount: data.amount - marketplaceFee
      }
    }

    const response = await preferenceApi.create({ body: preferenceData })
    return {
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
      marketplaceFee,
      ownerAmount: data.amount - marketplaceFee
    }
  } catch (error) {
    console.error('Error creating marketplace payment preference:', error)
    throw error
  }
}

// Función para obtener información de un pago
export async function getPaymentInfo(paymentId: string) {
  try {
    const paymentApi = getPaymentApi()
    const payment = await paymentApi.get({ id: paymentId })
    return payment
  } catch (error) {
    console.error('Error getting payment info:', error)
    throw error
  }
}

// Función para obtener estado de un pago
export async function getPaymentStatus(paymentId: string) {
  try {
    const payment = await getPaymentInfo(paymentId)
    return {
      status: payment.status,
      statusDetail: payment.status_detail,
      amount: payment.transaction_amount,
      externalReference: payment.external_reference,
      metadata: payment.metadata
    }
  } catch (error) {
    console.error('Error getting payment status:', error)
    throw error
  }
}

// Función para mapear estado de MercadoPago a estado interno
export function mapPaymentStatus(status: string, statusDetail: string) {
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

// Función legacy para mantener compatibilidad
export async function createPaymentPreference(data: {
  bookingId: string;
  amount: number;
  title: string;
  description: string;
  userEmail: string;
  userName: string;
}) {
  // Para mantener compatibilidad, usa el cliente principal sin marketplace
  try {
    const preferenceApi = getPreferenceApi();
    
    const preferenceData = {
      items: [
        {
          id: data.bookingId,
          title: data.title,
          description: data.description,
          unit_price: data.amount,
          quantity: 1,
          currency_id: "ARS"
        }
      ],
      payer: {
        name: data.userName,
        email: data.userEmail
      },
      external_reference: data.bookingId,
      back_urls: {
        success: `${paymentConfig.successUrl}?external_reference=${data.bookingId}`,
        failure: `${paymentConfig.failureUrl}?external_reference=${data.bookingId}`,
        pending: `${paymentConfig.pendingUrl}?external_reference=${data.bookingId}`
      },
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
    return {
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point
    }
  } catch (error) {
    console.error('Error creating payment preference:', error)
    throw error
  }
}
