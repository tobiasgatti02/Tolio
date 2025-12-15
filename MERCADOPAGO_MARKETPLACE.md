# MercadoPago Marketplace - Split Payments

## 📋 Resumen

Este proyecto usa **MercadoPago** para procesar pagos con split payments (pagos divididos) donde:
- **Marketplace recibe**: 2% de comisión sobre el monto del servicio
- **Vendedor/Proveedor recibe**: 98% del monto del servicio + 100% de materiales

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
# MercadoPago Marketplace (Producción)
MP_ACCESS_TOKEN=tu-access-token-de-produccion
MP_CLIENT_SECRET=tu-client-secret-de-produccion
NEXT_PUBLIC_MP_CLIENT_ID=tu-client-id-de-produccion

# MercadoPago Marketplace (Test/Sandbox)
MERCADOPAGO_ACCESS_TOKEN_SANDBOX=tu-access-token-sandbox
MERCADOPAGO_PUBLIC_KEY_SANDBOX=tu-public-key-sandbox
MERCADOPAGO_ENVIRONMENT=sandbox

# Configuración del Marketplace
MARKETPLACE_FEE_PERCENTAGE=2
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
NEXTAUTH_URL=https://tu-dominio.com
```

### Referencia de Implementación

Esta implementación está basada en el repositorio de ejemplo:
- **Repositorio**: https://github.com/goncy/next-mercadopago/tree/main/integraciones/marketplace
- **Documentación oficial**: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/marketplace

## 💰 Cómo Funcionan los Split Payments

### Pagos de Materiales
- **100% al proveedor** (sin comisión del marketplace)
- Se crea una preferencia de pago usando el access token del proveedor
- El proveedor recibe el pago completo directamente

### Pagos de Servicios
- **2% al marketplace** (comisión)
- **98% al proveedor** (monto del servicio)
- Se usa `marketplace_fee` en la preferencia de pago
- MercadoPago divide automáticamente el pago entre marketplace y proveedor

### Ejemplo de Split Payment

```typescript
const preference = await createServicePaymentPreference({
  bookingId: 'booking-123',
  serviceAmount: 1000, // $1000 ARS
  materialsAmount: 200, // $200 ARS
  clientEmail: '[email protected]',
  clientName: 'Juan Pérez',
  providerAccessToken: 'proveedor-access-token', // Token del proveedor
})

// Resultado:
// - Total: $1200 ARS
// - Marketplace: $20 ARS (2% de $1000)
// - Proveedor: $1180 ARS ($1000 - $20 + $200)
```

## 🔐 Onboarding de Vendedores

Los vendedores/proveedores deben:

1. **Conectar su cuenta de MercadoPago**:
   - Ir a Configuración → Pagos
   - Hacer clic en "Conectar MercadoPago"
   - Autorizar la aplicación mediante OAuth

2. **Proceso OAuth**:
   - El sistema redirige al vendedor a MercadoPago
   - El vendedor autoriza la aplicación
   - MercadoPago retorna un `access_token` y `refresh_token`
   - Estos tokens se guardan en la base de datos

3. **Uso del Access Token**:
   - Cuando se crea un pago, se usa el `access_token` del proveedor
   - Esto permite que MercadoPago divida el pago automáticamente
   - El marketplace recibe su comisión, el proveedor recibe el resto

## 📝 Flujo de Pago

### 1. Cliente inicia pago
```typescript
POST /api/payments/initialize
{
  "bookingId": "booking-123",
  "type": "SERVICE" // o "MATERIAL"
}
```

### 2. Sistema valida
- Verifica que el proveedor tenga MercadoPago conectado
- Calcula montos (comisión del 2% sobre servicio)
- Crea preferencia de pago con split

### 3. Cliente paga
- Se redirige al checkout de MercadoPago
- Completa el pago
- MercadoPago divide automáticamente:
  - Marketplace: 2%
  - Proveedor: 98%

### 4. Webhook procesa
- MercadoPago envía notificación
- Sistema actualiza estado del pago
- Se crean notificaciones para cliente y proveedor

## 🔄 Webhook de MercadoPago

El webhook está configurado en:
```
POST /api/mercadopago/webhook
```

### Procesamiento
1. Recibe notificación de MercadoPago
2. Obtiene información del pago
3. Busca el booking por `metadata.booking_id`
4. Actualiza estado del pago
5. Crea notificaciones

### Configuración del Webhook
1. Ve al dashboard de MercadoPago
2. Configuración → Webhooks
3. Agrega URL: `https://tu-dominio.com/api/mercadopago/webhook`
4. Eventos: `payment`

## 📊 Estructura de Datos

### Payment (Base de Datos)
```typescript
{
  id: string
  serviceBookingId: string
  type: 'MATERIAL' | 'SERVICE'
  amount: number // Monto total
  platformFee: number // Comisión del marketplace (2%)
  providerAmount: number // Monto que recibe el proveedor
  status: 'PENDING' | 'COMPLETED' | 'REFUNDED'
  metadata: {
    mercadopagoPreferenceId: string
    paymentProvider: 'mercadopago'
    serviceAmount?: number
    materialsAmount?: number
  }
}
```

## 🛠️ Archivos Principales

### Backend
- `lib/mercadopago.ts` - Servicio de MercadoPago con split payments
- `app/api/payments/initialize/route.ts` - Inicializa pagos
- `app/api/mercadopago/webhook/route.ts` - Procesa webhooks
- `app/api/mercadopago/connect/route.ts` - OAuth callback

### Frontend
- `components/mercadopago-connect.tsx` - Componente de conexión
- `components/mercadopago-status.tsx` - Estado de conexión

## ✅ Validaciones

- El proveedor debe tener MercadoPago conectado antes de recibir pagos
- Si no está conectado, se muestra error pidiendo que configure su cuenta
- Los pagos de materiales no tienen comisión (100% al proveedor)
- Los pagos de servicios tienen 2% de comisión (solo sobre el servicio, no sobre materiales)

## 🔒 Seguridad

- Los access tokens se guardan encriptados en la base de datos
- Los webhooks validan la firma de MercadoPago
- Los pagos se procesan solo si el proveedor está autorizado
- El marketplace fee se calcula automáticamente por MercadoPago

## 📚 Referencias

- [Repositorio de Ejemplo](https://github.com/goncy/next-mercadopago/tree/main/integraciones/marketplace)
- [Documentación MercadoPago Marketplace](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/marketplace)
- [API de Preferencias](https://www.mercadopago.com.ar/developers/es/reference/preferences/_checkout_preferences/post)


