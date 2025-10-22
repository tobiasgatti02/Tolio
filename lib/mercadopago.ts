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
  ownerAccessToken?: string; // Para marketplace split
}

// Función para obtener URL de autorización OAuth
export async function getAuthorizationUrl() {
  const oauth = new OAuth(mercadopago);
  
  const url = oauth.getAuthorizationURL({
    options: {
      client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/mercadopago/connect`,
    },
  });

  return url;
}

// API para crear preferencia de pago directo (sin split/escrow)
// O con marketplace split si se proporciona ownerAccessToken
export async function createPaymentPreference(data: CreatePreferenceData) {
  // Si el owner tiene MercadoPago configurado, usar su access token para marketplace
  const config = data.ownerAccessToken 
    ? new MercadoPagoConfig({ accessToken: data.ownerAccessToken })
    : mercadopago;

  const preference = await new Preference(config).create({
    body: {
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
      // Si es marketplace, agregar comisión
      ...(data.ownerAccessToken && {
        marketplace_fee: data.unit_price * 0.05, // 5% de comisión
      }),
      // URLs de retorno
      back_urls: {
        success: `${process.env.NEXTAUTH_URL}/bookings/${data.bookingId}?payment=success`,
        failure: `${process.env.NEXTAUTH_URL}/bookings/${data.bookingId}?payment=failure`,
        pending: `${process.env.NEXTAUTH_URL}/bookings/${data.bookingId}?payment=pending`,
      },
      auto_return: 'approved',
      // Notificaciones via webhook
      notification_url: `${process.env.NEXTAUTH_URL}/api/mercadopago/webhook`,
    },
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
  
  const credentials = await oauth.create({
    body: {
      client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID!,
      client_secret: process.env.MP_CLIENT_SECRET!,
      code,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/mercadopago/connect`,
    },
  });

  return credentials;
}
