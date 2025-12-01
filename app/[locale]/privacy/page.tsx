import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Política de Privacidad | Tolio",
  description: "Política de privacidad y protección de datos de Tolio",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Política de Privacidad</h1>
          </div>
          <p className="text-gray-400 mt-2">Última actualización: 1 de diciembre de 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-blue-800 text-sm">
            En Tolio, tu privacidad es importante para nosotros. Esta política explica cómo 
            recopilamos, usamos y protegemos tu información personal.
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Información que Recopilamos</h2>
            
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Información que nos proporcionas:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Nombre y apellidos</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono (opcional)</li>
              <li>Foto de perfil (opcional)</li>
              <li>Información de verificación de identidad</li>
              <li>Información de pago (procesada por terceros)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Información recopilada automáticamente:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Dirección IP y datos de ubicación aproximada</li>
              <li>Tipo de navegador y dispositivo</li>
              <li>Páginas visitadas y acciones en la plataforma</li>
              <li>Cookies y tecnologías similares</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Cómo Usamos tu Información</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Proporcionar y mejorar nuestros servicios</li>
              <li>Procesar transacciones y enviar notificaciones relacionadas</li>
              <li>Verificar la identidad de los usuarios</li>
              <li>Prevenir fraudes y actividades ilegales</li>
              <li>Personalizar tu experiencia en la plataforma</li>
              <li>Enviar comunicaciones de marketing (con tu consentimiento)</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Compartir Información</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Compartimos tu información únicamente en los siguientes casos:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Con otros usuarios:</strong> Información necesaria para completar transacciones (nombre, foto de perfil, reseñas)</li>
              <li><strong>Proveedores de servicios:</strong> Procesadores de pago, servicios de verificación, alojamiento</li>
              <li><strong>Requisitos legales:</strong> Cuando sea requerido por ley o para proteger nuestros derechos</li>
              <li><strong>Con tu consentimiento:</strong> En cualquier otro caso que requiera tu autorización</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>No vendemos</strong> tu información personal a terceros.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Seguridad de los Datos</h2>
            <p className="text-gray-600 leading-relaxed">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4">
              <li>Encriptación SSL/TLS para todas las comunicaciones</li>
              <li>Almacenamiento seguro de contraseñas (hash)</li>
              <li>Acceso restringido a datos personales</li>
              <li>Monitoreo continuo de seguridad</li>
              <li>Cumplimiento con estándares de la industria</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Utilizamos cookies y tecnologías similares para:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4">
              <li>Mantener tu sesión activa</li>
              <li>Recordar tus preferencias</li>
              <li>Analizar el uso de la plataforma</li>
              <li>Mostrar contenido relevante</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar 
              la funcionalidad de la plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Tus Derechos</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Acceso:</strong> Solicitar una copia de tus datos personales</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Eliminación:</strong> Solicitar la eliminación de tus datos</li>
              <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
              <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos</li>
              <li><strong>Limitación:</strong> Restringir el uso de tus datos</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Para ejercer estos derechos, contáctanos en{" "}
              <a href="mailto:privacidad@tolio.app" className="text-blue-600 hover:text-blue-700">
                privacidad@tolio.app
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Retención de Datos</h2>
            <p className="text-gray-600 leading-relaxed">
              Conservamos tu información personal mientras tu cuenta esté activa o sea necesario 
              para proporcionarte servicios. También podemos retener cierta información para cumplir 
              con obligaciones legales, resolver disputas y hacer cumplir nuestros acuerdos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Menores de Edad</h2>
            <p className="text-gray-600 leading-relaxed">
              Tolio no está dirigido a menores de 18 años. No recopilamos intencionalmente 
              información de menores. Si descubrimos que hemos recopilado datos de un menor, 
              los eliminaremos inmediatamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Transferencias Internacionales</h2>
            <p className="text-gray-600 leading-relaxed">
              Tus datos pueden ser transferidos y procesados en servidores ubicados fuera de tu 
              país de residencia. Nos aseguramos de que estas transferencias cumplan con las 
              regulaciones aplicables de protección de datos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Cambios en esta Política</h2>
            <p className="text-gray-600 leading-relaxed">
              Podemos actualizar esta política periódicamente. Te notificaremos sobre cambios 
              significativos por correo electrónico o mediante un aviso en la plataforma. 
              Te recomendamos revisar esta política regularmente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">11. Contacto</h2>
            <p className="text-gray-600 leading-relaxed">
              Si tienes preguntas sobre esta Política de Privacidad o el manejo de tus datos, 
              puedes contactarnos en:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="text-gray-700">
                <strong>Email:</strong>{" "}
                <a href="mailto:privacidad@tolio.app" className="text-blue-600 hover:text-blue-700">
                  privacidad@tolio.app
                </a>
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Dirección:</strong> Santiago de Chile, Chile
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
