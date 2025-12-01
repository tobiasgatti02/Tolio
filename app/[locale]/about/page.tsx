import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Users, Target, Heart, Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Sobre Nosotros | Tolio",
  description: "Conoce más sobre Tolio, la plataforma que conecta profesionales y herramientas en tu comunidad",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold mb-4">Sobre Nosotros</h1>
          <p className="text-xl text-blue-100">
            Conectando comunidades a través del intercambio de herramientas y servicios
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Misión */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Nuestra Misión</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            En Tolio creemos que compartir es la clave para construir comunidades más fuertes y sostenibles. 
            Nuestra misión es facilitar el acceso a herramientas y servicios profesionales, permitiendo que 
            las personas puedan realizar sus proyectos sin necesidad de comprar equipos costosos que usarán 
            pocas veces.
          </p>
        </section>

        {/* Qué hacemos */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">¿Qué Hacemos?</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            Tolio es una plataforma que conecta a personas que necesitan herramientas o servicios 
            con aquellas que pueden ofrecerlos. Ya sea que necesites un taladro para un proyecto 
            de fin de semana o busques un electricista de confianza, Tolio te ayuda a encontrarlo 
            en tu comunidad.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">🔧 Alquiler de Herramientas</h3>
              <p className="text-gray-600 text-sm">
                Encuentra taladros, escaleras, equipos de jardinería y más en tu zona. 
                Ahorra dinero alquilando en lugar de comprar.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">👷 Servicios Profesionales</h3>
              <p className="text-gray-600 text-sm">
                Conecta con plomeros, electricistas, pintores y otros profesionales 
                verificados de tu comunidad.
              </p>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Nuestros Valores</h2>
          </div>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900">Comunidad</h3>
              <p className="text-gray-600 text-sm">
                Creemos en el poder de las comunidades locales y en el valor de ayudarnos mutuamente.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900">Sostenibilidad</h3>
              <p className="text-gray-600 text-sm">
                Compartir recursos reduce el consumo innecesario y contribuye a un mundo más sostenible.
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900">Confianza</h3>
              <p className="text-gray-600 text-sm">
                Construimos relaciones basadas en la confianza a través de verificaciones y reseñas honestas.
              </p>
            </div>
          </div>
        </section>

        {/* Seguridad */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Tu Seguridad</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            La seguridad de nuestra comunidad es nuestra prioridad. Todos los usuarios pasan por un 
            proceso de verificación de identidad, y nuestro sistema de reseñas te ayuda a tomar 
            decisiones informadas. Además, ofrecemos opciones de depósito de seguridad para 
            proteger tanto a prestadores como a prestatarios.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Listo para unirte?</h2>
          <p className="text-gray-600 mb-6">
            Forma parte de la comunidad Tolio y comienza a compartir o encontrar lo que necesitas.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/items"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Explorar herramientas
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
