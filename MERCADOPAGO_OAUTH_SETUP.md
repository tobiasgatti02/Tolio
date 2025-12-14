# Configuración de OAuth de MercadoPago

## 🔧 Problema: Error de Redirección

Si ves el error "Tenemos un problema y ya estamos trabajando para resolverlo" al intentar conectar MercadoPago, significa que la **URL de redirección no está configurada correctamente** en tu aplicación de MercadoPago.

## ✅ Solución: Configurar URL de Redirección

### Paso 1: Obtener tu URL de Redirección

La URL de redirección que usa tu aplicación es:
```
http://localhost:3000/api/mercadopago/connect
```

**Para producción:**
```
https://tu-dominio.com/api/mercadopago/connect
```

### Paso 2: Configurar en MercadoPago

1. **Ingresa al Dashboard de MercadoPago**:
   - Ve a [https://www.mercadopago.com.ar/developers/panel](https://www.mercadopago.com.ar/developers/panel)
   - Inicia sesión con tu cuenta

2. **Selecciona tu Aplicación**:
   - Busca la aplicación con Client ID: `3688472108919329` (o tu Client ID)
   - Haz clic en la aplicación

3. **Configurar URLs de Redirección**:
   - Ve a la sección **"URLs de redirección"** o **"Redirect URIs"**
   - Agrega las siguientes URLs:

   **Para Desarrollo (Localhost):**
   ```
   http://localhost:3000/api/mercadopago/connect
   ```

   **Para Producción:**
   ```
   https://tu-dominio.com/api/mercadopago/connect
   ```

   ⚠️ **IMPORTANTE**: 
   - La URL debe coincidir **EXACTAMENTE** (incluyendo http/https, puerto, y ruta completa)
   - No agregues una barra final (`/`) al final
   - Puedes agregar múltiples URLs (una para desarrollo y otra para producción)

4. **Guardar Cambios**:
   - Haz clic en "Guardar" o "Save"
   - Espera unos minutos para que los cambios se propaguen

### Paso 3: Verificar Variables de Entorno

Asegúrate de que tienes estas variables configuradas:

```env
# Para Desarrollo
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Para Producción
NEXTAUTH_URL=https://tu-dominio.com
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# MercadoPago
NEXT_PUBLIC_MP_CLIENT_ID=3688472108919329
MP_CLIENT_SECRET=tu-client-secret
MP_ACCESS_TOKEN=tu-access-token
```

### Paso 4: Probar la Conexión

1. Reinicia tu servidor de desarrollo
2. Ve a Configuración → Pagos
3. Haz clic en "Conectar MercadoPago"
4. Deberías ser redirigido correctamente a MercadoPago

## 🔍 Verificación de Errores Comunes

### Error 1: "Tenemos un problema..."
**Causa**: URL de redirección no configurada o no coincide
**Solución**: Verifica que la URL en MercadoPago coincida exactamente con la que usa tu app

### Error 2: "redirect_uri_mismatch"
**Causa**: La URL de redirección no está en la lista de URLs permitidas
**Solución**: Agrega la URL exacta en el dashboard de MercadoPago

### Error 3: "invalid_client"
**Causa**: Client ID o Client Secret incorrectos
**Solución**: Verifica las credenciales en las variables de entorno

## 📝 Notas Importantes

1. **URLs Diferentes para Desarrollo y Producción**:
   - Puedes configurar múltiples URLs de redirección en MercadoPago
   - Una para `http://localhost:3000` (desarrollo)
   - Otra para `https://tu-dominio.com` (producción)

2. **Protocolo HTTP vs HTTPS**:
   - En desarrollo local, usa `http://`
   - En producción, usa `https://`
   - MercadoPago requiere HTTPS en producción

3. **Puerto**:
   - Si usas un puerto diferente a 3000, actualiza la URL en MercadoPago
   - Ejemplo: `http://localhost:3001/api/mercadopago/connect`

4. **Tiempo de Propagación**:
   - Los cambios en MercadoPago pueden tardar 1-2 minutos en aplicarse
   - Si sigue fallando, espera unos minutos y vuelve a intentar

## 🔗 Referencias

- [Documentación OAuth de MercadoPago](https://www.mercadopago.com.ar/developers/es/docs/security/oauth)
- [Dashboard de MercadoPago](https://www.mercadopago.com.ar/developers/panel)

