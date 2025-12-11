## Configuración de Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# DLocal Test Environment
DLOCAL_API_KEY_TEST=SCPTmGsNJhDCKBRjOJJlTIWjwEQfeKes
DLOCAL_API_URL_TEST=https://api-sbx.dlocalgo.com/
DLOCAL_SECRET_KEY_TEST=eDW7JZlkdnnlGw5MVSRqGFa0nXxiMQjNAWjBXUjl

# Marketplace Configuration
MARKETPLACE_FEE_PERCENTAGE=2
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Tarjeta de Prueba

Para probar pagos rechazados:
- **Número**: 5555 5555 5555 4444
- **Fecha de expiración**: Cualquier fecha futura
- **CVV**: Cualquier CVV

## Notas Importantes

- Estamos usando el ambiente de **sandbox** de DLocal
- Los pagos no son reales
- La URL del webhook debe ser accesible públicamente (usa ngrok para desarrollo local)
