import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import FeaturedItems from "@/components/featured-items"
import HomeHeroSection from "@/components/home-hero-section"
import HomeCtaSection from "@/components/home-cta-section"
import { Suspense } from "react"

export default function Home() {
  return (
    <div className="flex flex-col scroll-smooth">
      {/* Hero Section - Client Component with session logic */}
      <HomeHeroSection />



      {/* Featured Items Section - Server Component */}
      <section className="relative min-h-screen flex items-center justify-center py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-8 md:mb-12 text-center md:text-left gap-4 md:gap-0">
            <div className="mb-4 md:mb-0">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-2 md:mb-3">Publicaciones destacadas</h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600">Servicios y herramientas disponibles cerca de ti</p>
            </div>
            <Link href="/items" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all duration-300 font-bold text-base md:text-lg shadow-lg hover:shadow-xl hover:scale-105">
              Ver Todos
            </Link>
          </div>
          <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-72 sm:h-80 md:h-96 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>}>
            <FeaturedItems />
          </Suspense>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-20 bg-gradient-to-br from-emerald-50 via-white to-blue-50 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center mb-10 md:mb-16 px-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 md:mb-6">Construyendo confianza en la comunidad</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Sistema de verificación y reviews que genera confianza entre usuarios
            </p>
          </div>
          <div className="max-w-4xl mx-auto px-2">
            <div className="space-y-6 md:space-y-8">
              <div className="text-center">
                <h3 className="text-2xl sm:text-3xl font-black mb-4 md:mb-6 text-gray-900">Sistema de confianza</h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6 md:mb-8">
                  En Tolio medimos la confianza en lugar de simples estrellas. Cada transacción exitosa 
                  aumenta tu nivel de confianza, creando una comunidad más segura para todos.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                <div className="flex items-start space-x-3 md:space-x-4 bg-emerald-50 p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl border border-emerald-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-800 text-base md:text-lg font-semibold">Reviews honestas después de cada alquiler</span>
                </div>
                <div className="flex items-start space-x-3 md:space-x-4 bg-emerald-50 p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl border border-emerald-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-800 text-base md:text-lg font-semibold">Depósitos de seguridad opcionales</span>
                </div>
                <div className="flex items-start space-x-3 md:space-x-4 bg-emerald-50 p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl border border-emerald-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-800 text-base md:text-lg font-semibold">Comunicación segura en la plataforma</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Client Component with session logic */}
      <HomeCtaSection />
    </div>
  );
}
