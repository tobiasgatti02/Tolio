## 🔑 Configuración de OAuth

Para habilitar el login con Google y Facebook, necesitas configurar las siguientes variables de entorno:

### Variables requeridas en `.env.local`:

```bash
# Google OAuth (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu_google_client_secret

# Facebook OAuth (https://developers.facebook.com)
FACEBOOK_CLIENT_ID=tu_facebook_app_id
FACEBOOK_CLIENT_SECRET=tu_facebook_app_secret

# NextAuth
NEXTAUTH_URL=https://localhost:3000
NEXTAUTH_SECRET=tu_secreto_aleatorio_muy_seguro
```

### Guía Rápida:

#### Google OAuth:
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto → APIs & Services → Credentials
3. Crear credenciales → OAuth 2.0 Client ID
4. Agregar URIs autorizados:
   - `https://localhost:3000/api/auth/callback/google`
   - Tu dominio de producción

#### Facebook OAuth:
1. Ve a [Facebook Developers](https://developers.facebook.com)
2. Crear App → Agregar Facebook Login
3. Configurar URIs de redirección:
   - `https://localhost:3000/api/auth/callback/facebook`
   - Tu dominio de producción

**Nota**: Los botones funcionarán pero mostrarán un error hasta que configures las credenciales.
