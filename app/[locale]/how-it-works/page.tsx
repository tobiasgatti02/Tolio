import { Metadata } from "next"
import Link from "next/link"
import { 
  ArrowRight, Search, Calendar, Handshake, Star, 
  Camera, DollarSign, Users, Shield, AlertTriangle,
  Package, Wrench, CheckCircle, XCircle
} from "lucide-react"

export const metadata: Metadata = {
  title: "Cómo Funciona | Tolio",
  description: "Aprende cómo alquilar y prestar herramientas o servicios en Tolio",
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">¿Cómo funciona Tolio?</h1>
          <p className="text-xl text-orange-100">
            Conectamos personas que necesitan herramientas con quienes las tienen. 
            Simple, rápido y seguro.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Dos opciones principales */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Alquilar */}
          <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiero Alquilar</h2>
            <p className="text-gray-600 mb-4">Necesito una herramienta o servicio</p>
            <a href="#alquilar" className="text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Ver cómo <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Prestar */}
          <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiero Prestar</h2>
            <p className="text-gray-600 mb-4">Tengo herramientas o servicios para ofrecer</p>
            <a href="#prestar" className="text-orange-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Ver cómo <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* SECCIÓN: ALQUILAR */}
        <section id="alquilar" className="mb-16 scroll-mt-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Quiero Alquilar</h2>
          </div>

          <div className="space-y-6">
            {/* Paso 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Busca lo que necesitas</h3>
                <p className="text-gray-600">
                  Explora herramientas o servicios por categoría, ubicación o palabra clave. 
                  Filtra por precio, distancia y valoraciones.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Revisa los detalles</h3>
                <p className="text-gray-600">
                  Mira las fotos, descripción, precio por día y reseñas de otros usuarios. 
                  Revisa la reputación del dueño antes de solicitar.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Solicita la reserva</h3>
                <p className="text-gray-600">
                  Selecciona las fechas que necesitas y envía tu solicitud. 
                  El dueño recibirá una notificación y podrá aceptar o rechazar.
                </p>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Coordina la entrega</h3>
                <p className="text-gray-600">
                  Una vez aceptada, coordina con el dueño dónde y cuándo recoger el artículo. 
                  Revísalo antes de llevártelo.
                </p>
              </div>
            </div>

            {/* Paso 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Devuelve y califica</h3>
                <p className="text-gray-600">
                  Al terminar, devuelve el artículo en las mismas condiciones. 
                  Deja una reseña para ayudar a otros usuarios.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN: PRESTAR */}
        <section id="prestar" className="mb-16 scroll-mt-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Quiero Prestar</h2>
          </div>

          <div className="space-y-6">
            {/* Paso 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Crea tu cuenta</h3>
                <p className="text-gray-600">
                  Regístrate con tu email o Google. Completa tu perfil para generar confianza.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Publica tu artículo o servicio</h3>
                <p className="text-gray-600">
                  Sube fotos claras, escribe una descripción detallada, 
                  define el precio por día y si requieres depósito de seguridad.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Recibe solicitudes</h3>
                <p className="text-gray-600">
                  Cuando alguien quiera alquilar, recibirás una notificación. 
                  Revisa el perfil y reputación del solicitante antes de aceptar.
                </p>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Entrega y recibe</h3>
                <p className="text-gray-600">
                  Coordina la entrega con el arrendatario. Al finalizar el período, 
                  recibe tu artículo de vuelta y verifica su estado.
                </p>
              </div>
            </div>

            {/* Paso 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Recibe el pago y califica</h3>
                <p className="text-gray-600">
                  El pago se libera cuando confirmas la devolución. 
                  Deja una reseña sobre el arrendatario.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN: IMPORTANTE - RESPONSABILIDAD */}
        <section className="mb-16">
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">⚠️ Importante: Responsabilidad</h2>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>Tolio es una plataforma de conexión</strong> entre usuarios. 
                    Facilitamos el contacto, pero <strong>no somos responsables</strong> de:
                  </p>
                  
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Robos o pérdidas:</strong> Si un artículo no es devuelto, es responsabilidad del dueño tomar las medidas legales correspondientes.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Daños a los artículos:</strong> Los acuerdos de compensación son entre usuarios. El depósito de seguridad es opcional y lo gestiona el dueño.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Calidad de servicios:</strong> Los servicios son prestados por terceros independientes.</span>
                    </li>
                  </ul>

                  <div className="bg-white rounded-lg p-4 mt-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      El sistema de reputación te protege
                    </h3>
                    <p className="text-sm text-gray-600">
                      Cada usuario tiene un perfil con reseñas y calificaciones. 
                      <strong> Los malos comportamientos quedan registrados</strong> y afectan la reputación, 
                      haciendo que sea difícil para usuarios problemáticos seguir usando la plataforma. 
                      <strong> Siempre revisa las reseñas antes de aceptar o solicitar.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Consejos de seguridad */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            Consejos de Seguridad
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Verifica la identidad</h3>
              <p className="text-sm text-gray-600">Revisa el perfil, reseñas y tiempo en la plataforma antes de acordar.</p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Documenta todo</h3>
              <p className="text-sm text-gray-600">Toma fotos del estado del artículo antes y después del préstamo.</p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Usa el chat de la plataforma</h3>
              <p className="text-sm text-gray-600">Mantén las conversaciones dentro de Tolio para tener registro.</p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Pide depósito si es valioso</h3>
              <p className="text-sm text-gray-600">Para artículos de alto valor, solicita un depósito de seguridad.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Listo para empezar?</h2>
          <p className="text-gray-600 mb-6">
            Únete a la comunidad de Tolio y comienza a compartir o encontrar lo que necesitas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/items"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Explorar Herramientas
            </Link>
            <Link
              href="/signup"
              className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
            >
              Crear Cuenta Gratis
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
