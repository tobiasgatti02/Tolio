import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Términos de Servicio | Tolio",
  description: "Términos y condiciones de uso de la plataforma Tolio",
}

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold">Términos de Servicio</h1>
          <p className="text-gray-400 mt-2">Última actualización: 1 de diciembre de 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
            <p className="text-gray-600 leading-relaxed">
              Al acceder y utilizar Tolio ("la Plataforma"), aceptas estar sujeto a estos Términos de Servicio. 
              Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Descripción del Servicio</h2>
            <p className="text-gray-600 leading-relaxed">
              Tolio es una plataforma que conecta a personas que desean alquilar herramientas y equipos 
              con personas que los necesitan temporalmente. También facilitamos la conexión con profesionales 
              que ofrecen servicios. Tolio actúa únicamente como intermediario y no es parte de las 
              transacciones entre usuarios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Registro y Cuenta</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Para utilizar ciertas funciones de la Plataforma, debes crear una cuenta. Te comprometes a:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Proporcionar información veraz, precisa y actualizada</li>
              <li>Mantener la confidencialidad de tu contraseña</li>
              <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta</li>
              <li>Ser mayor de 18 años o tener autorización de un tutor legal</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Publicación de Artículos y Servicios</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Al publicar artículos o servicios en Tolio, declaras y garantizas que:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Eres el propietario legítimo del artículo o tienes autorización para alquilarlo</li>
              <li>El artículo se encuentra en condiciones de uso seguras</li>
              <li>La descripción e imágenes son precisas y no engañosas</li>
              <li>Cumples con todas las leyes y regulaciones aplicables</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Reservas y Pagos</h2>
            <p className="text-gray-600 leading-relaxed">
              Las reservas se realizan a través de la Plataforma. Los pagos son procesados por proveedores 
              externos de pago. Tolio cobra una comisión por cada transacción completada. Los depósitos 
              de seguridad, cuando apliquen, se retendrán y liberarán según las políticas establecidas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Responsabilidades del Usuario</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Los usuarios son responsables de:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Inspeccionar los artículos antes de recibirlos</li>
              <li>Utilizar los artículos de manera adecuada y segura</li>
              <li>Devolver los artículos en el estado en que fueron recibidos</li>
              <li>Comunicar cualquier problema o daño de manera inmediata</li>
              <li>Cumplir con los plazos acordados</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Limitación de Responsabilidad</h2>
            <p className="text-gray-600 leading-relaxed">
              Tolio no es responsable de los daños, pérdidas o lesiones que puedan ocurrir durante el uso 
              de artículos alquilados o servicios contratados a través de la Plataforma. Las transacciones 
              son entre usuarios, y Tolio solo facilita la conexión entre ellos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Contenido Prohibido</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Está prohibido publicar:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Artículos ilegales o robados</li>
              <li>Contenido ofensivo, discriminatorio o inapropiado</li>
              <li>Información falsa o engañosa</li>
              <li>Artículos peligrosos sin las debidas precauciones</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Terminación</h2>
            <p className="text-gray-600 leading-relaxed">
              Tolio se reserva el derecho de suspender o terminar tu cuenta si violas estos términos, 
              sin previo aviso y sin responsabilidad alguna.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Modificaciones</h2>
            <p className="text-gray-600 leading-relaxed">
              Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios 
              entrarán en vigencia inmediatamente después de su publicación en la Plataforma. El uso 
              continuado del servicio constituye la aceptación de los nuevos términos.
            </p>
          </section>

          
        </div>
      </div>
    </div>
  )
}
