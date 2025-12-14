import { MercadoPagoConfig, Preference, Payment, OAuth } from 'mercadopago';

// Configuración de MercadoPago
export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

// Tipos para preferencias
export interface CreatePreferenceData {
  title: string;
  quantity: number;
  unit_price: number;
  bookingId: string;
  userId: string;
  itemId: string;
  ownerAccessToken?: string; // Para marketplace split - debe ser el access token del vendedor
}

// Tipos para pagos de servicios
export interface CreateServicePaymentData {
  bookingId: string;
  serviceAmount: number;
  materialsAmount?: number;
  clientEmail: string;
  clientName: string;
  providerAccessToken?: string; // Access token del proveedor para split payment
}

// Función para obtener URL de autorización OAuth
export async function getAuthorizationUrl() {
  const oauth = new OAuth(mercadopago);
  
  // Usar NEXTAUTH_URL o NEXT_PUBLIC_APP_URL como fallback
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/mercadopago/connect`;
  
  console.log('[MercadoPago OAuth] Redirect URI:', redirectUri);
  console.log('[MercadoPago OAuth] Client ID:', process.env.NEXT_PUBLIC_MP_CLIENT_ID);
  
  const url = oauth.getAuthorizationURL({
    options: {
      client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID!,
      redirect_uri: redirectUri,
    },
  });

  return url;
}

/**
 * Crea una preferencia de pago con split payment para marketplace
 * 
 * Si ownerAccessToken está presente, se usa para crear un split payment donde:
 * - Marketplace recibe el marketplace_fee (2% por defecto)
 * - Vendedor recibe el resto
 * 
 * Referencia: https://github.com/goncy/next-mercadopago/tree/main/integraciones/marketplace
 */
export async function createPaymentPreference(data: CreatePreferenceData) {
  const marketplaceFeePercentage = parseFloat(process.env.MARKETPLACE_FEE_PERCENTAGE || '2') / 100;
  const marketplaceFee = Math.round(data.unit_price * marketplaceFeePercentage * 100) / 100;

  // Si el vendedor tiene MercadoPago configurado, usar su access token para marketplace split
  const config = data.ownerAccessToken 
    ? new MercadoPagoConfig({ accessToken: data.ownerAccessToken })
    : mercadopago;

  const preferenceBody: any = {
    items: [
      {
        id: data.itemId,
        title: data.title,
        quantity: data.quantity,
        unit_price: data.unit_price,
      },
    ],
    // Metadata para asociar con nuestro booking
    metadata: {
      booking_id: data.bookingId,
      user_id: data.userId,
      item_id: data.itemId,
    },
    // URLs de retorno
    back_urls: {
      success: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${data.bookingId}?payment=success`,
      failure: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${data.bookingId}?payment=failure`,
      pending: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${data.bookingId}?payment=pending`,
    },
    auto_return: 'approved',
    // Notificaciones via webhook
    notification_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
  };

  // Si el vendedor tiene cuenta conectada, usar marketplace split
  if (data.ownerAccessToken) {
    preferenceBody.marketplace_fee = marketplaceFee;
    console.log(`💰 MercadoPago Split Payment: ${marketplaceFee} (${marketplaceFeePercentage * 100}%) para marketplace, ${data.unit_price - marketplaceFee} para vendedor`);
  } else {
    console.warn('⚠️  Vendedor no tiene MercadoPago conectado. El pago irá 100% al marketplace.');
  }

  const preference = await new Preference(config).create({
    body: preferenceBody,
  });

  return preference;
}

/**
 * Crea una preferencia de pago para servicios con split payment
 * 
 * Para servicios:
 * - Materiales: 100% al proveedor (sin comisión)
 * - Servicio: 2% al marketplace, 98% al proveedor
 */
export async function createServicePaymentPreference(data: CreateServicePaymentData) {
  const marketplaceFeePercentage = parseFloat(process.env.MARKETPLACE_FEE_PERCENTAGE || '2') / 100;
  const materialsAmount = data.materialsAmount || 0;
  const totalAmount = data.serviceAmount + materialsAmount;
  
  // La comisión solo se aplica sobre el monto del servicio, no sobre materiales
  const marketplaceFee = Math.round(data.serviceAmount * marketplaceFeePercentage * 100) / 100;
  const providerAmount = totalAmount - marketplaceFee;

  // Si el proveedor tiene MercadoPago configurado, usar su access token para marketplace split
  const config = data.providerAccessToken 
    ? new MercadoPagoConfig({ accessToken: data.providerAccessToken })
    : mercadopago;

  const preferenceBody: any = {
    items: [
      {
        id: `service-${data.bookingId}`,
        title: `Pago de servicio - Reserva ${data.bookingId.substring(0, 8)}`,
        quantity: 1,
        unit_price: totalAmount,
      },
    ],
    // Metadata para asociar con nuestro booking
    metadata: {
      booking_id: data.bookingId,
      payment_type: 'SERVICE',
      service_amount: data.serviceAmount.toString(),
      materials_amount: materialsAmount.toString(),
    },
    // URLs de retorno
    back_urls: {
      success: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${data.bookingId}?payment=success&type=service`,
      failure: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${data.bookingId}?payment=failure`,
      pending: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${data.bookingId}?payment=pending`,
    },
    auto_return: 'approved',
    // Notificaciones via webhook
    notification_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
    payer: {
      email: data.clientEmail,
      name: data.clientName,
    },
  };

  // Si el proveedor tiene cuenta conectada, usar marketplace split
  if (data.providerAccessToken) {
    preferenceBody.marketplace_fee = marketplaceFee;
    console.log(`💰 MercadoPago Service Split Payment:`);
    console.log(`   Total: ${totalAmount}`);
    console.log(`   Marketplace (${marketplaceFeePercentage * 100}%): ${marketplaceFee}`);
    console.log(`   Provider: ${providerAmount}`);
  } else {
    console.warn('⚠️  Proveedor no tiene MercadoPago conectado. El pago irá 100% al marketplace.');
  }

  const preference = await new Preference(config).create({
    body: preferenceBody,
  });

  return preference;
}

// API para obtener información de un pago
export async function getPaymentInfo(paymentId: string) {
  const payment = await new Payment(mercadopago).get({ id: paymentId });
  return payment;
}

// API para intercambiar código de autorización por tokens
export async function exchangeCodeForTokens(code: string) {
  const oauth = new OAuth(mercadopago);
  
  // Usar la misma URL que en getAuthorizationUrl
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/mercadopago/connect`;
  
  console.log('[MercadoPago OAuth] Exchanging code, redirect_uri:', redirectUri);
  
  const credentials = await oauth.create({
    body: {
      client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID!,
      client_secret: process.env.MP_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
    },
  });

  return credentials;
}
