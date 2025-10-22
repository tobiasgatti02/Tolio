import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY no está definida en las variables de entorno');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

// Configuración del marketplace
export const MARKETPLACE_FEE_PERCENTAGE = parseInt(
  process.env.MARKETPLACE_FEE_PERCENTAGE || '5'
);

/**
 * Calcula los montos del pago incluyendo el fee del marketplace
 */
export function calculatePaymentAmounts(totalAmount: number) {
  const marketplaceFee = Math.round(totalAmount * (MARKETPLACE_FEE_PERCENTAGE / 100));
  const ownerAmount = totalAmount - marketplaceFee;
  
  return {
    totalAmount,
    marketplaceFee,
    ownerAmount,
    marketplaceAmount: marketplaceFee
  };
}

/**
 * Convierte monto de dólares a centavos para Stripe
 */
export function toStripeAmount(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convierte monto de centavos de Stripe a dólares
 */
export function fromStripeAmount(amount: number): number {
  return amount / 100;
}