# Configuración de MercadoPago en Vercel

## Variables de Entorno Requeridas

Para que MercadoPago funcione en Vercel, necesitas configurar las siguientes variables de entorno en el dashboard de Vercel:

### 1. Ve a tu proyecto en Vercel
- Abre [vercel.com](https://vercel.com)
- Ve a tu proyecto
- Click en "Settings" → "Environment Variables"

### 2. Agrega estas variables:

#### MercadoPago (Sandbox)
```
MERCADOPAGO_ACCESS_TOKEN_SANDBOX=APP_USR-3688472108919329-072017-d41c8d6d1475e61596cf6dfef17c56f1-691662798
MERCADOPAGO_PUBLIC_KEY_SANDBOX=APP_USR-5b9048d4-5c23-47d6-937a-407cda72b392
MERCADOPAGO_WEBHOOK_SECRET_SANDBOX=1819c45772cb4d794916ff886fc93d078071e31d3bcd44c89b03497b197a4d41
MERCADOPAGO_ENVIRONMENT=sandbox
```

#### URLs de MercadoPago (reemplaza tu-dominio.vercel.app con tu dominio real)
```
MERCADOPAGO_SUCCESS_URL=https://tu-dominio.vercel.app/payment/success
MERCADOPAGO_FAILURE_URL=https://tu-dominio.vercel.app/payment/failure
MERCADOPAGO_PENDING_URL=https://tu-dominio.vercel.app/payment/pending
MERCADOPAGO_WEBHOOK_URL=https://tu-dominio.vercel.app/api/webhooks/mercadopago
```

#### Auth
```
AUTH_SECRET=uNNKlTdHW7+k80pGchuc+9+dfXjN+2cp2AS477kqDwI=
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=uNNKlTdHW7+k80pGchuc+9+dfXjN+2cp2AS477kqDwI=
```

### 3. Redeploy
Después de agregar las variables, haz un nuevo deploy:
```bash
vercel --prod
```

## Para Producción

Cuando estés listo para producción, cambia estas variables:
```
MERCADOPAGO_ACCESS_TOKEN=tu-token-de-produccion
MERCADOPAGO_PUBLIC_KEY=tu-public-key-de-produccion
MERCADOPAGO_ENVIRONMENT=production
```

## Verificación

Puedes verificar que las variables están configuradas correctamente usando:
- En desarrollo: `http://localhost:3001/api/debug/env`
- **NO usar en producción** (el endpoint está bloqueado)

## Troubleshooting

Si sigues teniendo el error "MercadoPago access token not found":
1. Verifica que las variables estén exactamente como arriba
2. Asegúrate de hacer redeploy después de agregar las variables
3. Revisa los logs de Vercel para ver el mensaje de debug detallado
