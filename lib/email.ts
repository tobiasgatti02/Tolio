import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendVerificationEmailParams {
  email: string
  firstName: string
  verificationToken: string
}

export async function sendVerificationEmail({
  email,
  firstName,
  verificationToken,
}: SendVerificationEmailParams) {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`

  console.log('Configuración de email:', {
    apiKeyExists: !!process.env.RESEND_API_KEY,
    baseUrl,
    verificationUrl,
    toEmail: email
  })

  try {
    const { data, error } = await resend.emails.send({
      from: 'Tolio <no-reply@tolio.app>', // En producción: tu dominio verificado
      to: [email],
      subject: '¡Verifica tu cuenta en Tolio!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">¡Bienvenido a Tolio!</h1>
            </div>

            <!-- Content -->
            <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1f2937; margin-top: 0;">Hola ${firstName},</h2>
              
              <p style="font-size: 16px; color: #4b5563; margin: 20px 0;">
                Gracias por registrarte en Tolio, la plataforma para conectar con profesionales de oficios y alquilar herramientas en tu zona.
              </p>

              <p style="font-size: 16px; color: #4b5563; margin: 20px 0;">
                Para comenzar a usar tu cuenta, necesitamos verificar tu dirección de email. Haz clic en el botón de abajo:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  Verificar mi cuenta
                </a>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin: 30px 0; padding: 20px; background: #f9fafb; border-left: 4px solid #f97316; border-radius: 4px;">
                <strong>💡 Importante:</strong> Este enlace expira en 24 horas. Si no solicitaste esta verificación, puedes ignorar este email.
              </p>

              <!-- Alternative Link -->
              <p style="font-size: 14px; color: #6b7280; margin: 30px 0;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 4px;">
                ${verificationUrl}
              </p>

              <!-- Features -->
              <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb;">
                <h3 style="color: #1f2937; margin-bottom: 20px;">¿Qué puedes hacer en Tolio?</h3>
                <div style="display: grid; gap: 15px;">
                  <div style="display: flex; align-items: start; gap: 12px;">
                    <span style="background: #dbeafe; color: #2563eb; padding: 8px; border-radius: 8px; font-size: 20px;">🔧</span>
                    <div>
                      <strong style="color: #1f2937;">Alquila herramientas</strong>
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Encuentra taladros, escaleras y más en tu zona</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: start; gap: 12px;">
                    <span style="background: #dbeafe; color: #2563eb; padding: 8px; border-radius: 8px; font-size: 20px;">👷</span>
                    <div>
                      <strong style="color: #1f2937;">Contrata servicios</strong>
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Plomeros, electricistas, pintores y más</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: start; gap: 12px;">
                    <span style="background: #dcfce7; color: #16a34a; padding: 8px; border-radius: 8px; font-size: 20px;">💰</span>
                    <div>
                      <strong style="color: #1f2937;">Gana dinero extra</strong>
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Ofrece tus servicios o alquila tus herramientas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 30px 20px; color: #9ca3af; font-size: 12px;">
              <p style="margin: 5px 0;">© 2025 Tolio. Todos los derechos reservados.</p>
              <p style="margin: 5px 0;">
                <a href="${process.env.NEXTAUTH_URL}/terms" style="color: #6b7280; text-decoration: none;">Términos</a> · 
                <a href="${process.env.NEXTAUTH_URL}/privacy" style="color: #6b7280; text-decoration: none;">Privacidad</a> · 
                <a href="${process.env.NEXTAUTH_URL}/help" style="color: #6b7280; text-decoration: none;">Ayuda</a>
              </p>
            </div>

          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending verification email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmail({
  email,
  firstName,
  resetToken,
}: {
  email: string
  firstName: string
  resetToken: string
}) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

  try {
    const { data, error } = await resend.emails.send({
      from: 'Tolio <onboarding@resend.dev>',
      to: [email],
      subject: 'Recupera tu contraseña - Tolio',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <div style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Recuperar Contraseña</h1>
            </div>

            <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1f2937; margin-top: 0;">Hola ${firstName},</h2>
              
              <p style="font-size: 16px; color: #4b5563; margin: 20px 0;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en Tolio.
              </p>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  Restablecer Contraseña
                </a>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin: 30px 0; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <strong>⚠️ Seguridad:</strong> Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este email y tu contraseña permanecerá sin cambios.
              </p>

              <p style="font-size: 14px; color: #6b7280; margin: 30px 0;">
                Si el botón no funciona, copia y pega este enlace:
              </p>
              <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 4px;">
                ${resetUrl}
              </p>
            </div>

            <div style="text-align: center; padding: 30px 20px; color: #9ca3af; font-size: 12px;">
              <p style="margin: 5px 0;">© 2025 Tolio. Todos los derechos reservados.</p>
            </div>

          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending password reset email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error }
  }
}
