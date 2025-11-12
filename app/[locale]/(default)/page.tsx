import Link from "next/link"
import { Search, TrendingUp, Clock, Shield, Wrench, Briefcase, MapPin, Star, Users, CheckCircle2 } from "lucide-react"
import FeaturedItems from "@/components/featured-items"
import HeroSearch from "@/components/hero-search"
import CategoryList from "@/components/category-list"
import { Suspense } from "react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Improved with more breathing room */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 py-32 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          {/* Main Headline - Bigger, bolder */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-8 drop-shadow-2xl leading-tight">
            Conecta con Oficios<br />y Herramientas
          </h1>
          {/* Subtitle - More spacious */}
          <p className="text-xl md:text-2xl text-white/90 mb-16 max-w-3xl mx-auto leading-relaxed">
            Publicá tu servicio, ofrecé herramientas o encontrá lo que necesitás en tu comunidad
          </p>
          {/* Main Action Buttons - Larger, more prominent */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-20">
            <Link 
              href="/services"
              className="group relative bg-white hover:bg-gray-50 text-gray-900 px-10 py-8 rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 w-full md:w-auto md:min-w-[400px]">
              <div className="flex items-center justify-center space-x-5">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                  <Briefcase className="h-10 w-10 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-3xl font-black mb-1">Buscar Servicios</h3>
                  <p className="text-gray-600 text-base">Plomeros, electricistas, pintores...</p>
                </div>
              </div>
            </Link>
            <Link 
              href="/items"
              className="group relative bg-white hover:bg-gray-50 text-gray-900 px-10 py-8 rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 w-full md:w-auto md:min-w-[400px]">
              <div className="flex items-center justify-center space-x-5">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                  <Wrench className="h-10 w-10 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-3xl font-black mb-1">Alquilar Herramientas</h3>
                  <p className="text-gray-600 text-base">Taladros, escaleras, equipos...</p>
                </div>
              </div>
            </Link>
          </div>
          {/* Feature Icons - More spacious */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mb-2 shadow-lg">
                <Search className="h-8 w-8" />
              </div>
              <span className="text-lg font-semibold">Busca oficios</span>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mb-2 shadow-lg">
                <Clock className="h-8 w-8" />
              </div>
              <span className="text-lg font-semibold">Conecta directo</span>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mb-2 shadow-lg">
                <Shield className="h-8 w-8" />
              </div>
              <span className="text-lg font-semibold">Comunidad confiable</span>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mb-2 shadow-lg">
                <TrendingUp className="h-8 w-8" />
              </div>
              <span className="text-lg font-semibold">Publica gratis</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - More breathing room */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-6">Categorías de servicios</h2>
            <p className="text-xl text-gray-600 leading-relaxed">Encuentra el oficio que necesitas en tu zona</p>
          </div>
          <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>}>
            <CategoryList />
          </Suspense>
        </div>
      </section>

      {/* Featured Items Section - Better spacing */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="mb-6 md:mb-0">
              <h2 className="text-5xl font-black text-gray-900 mb-3">Publicaciones destacadas</h2>
              <p className="text-xl text-gray-600">Servicios y herramientas disponibles cerca de ti</p>
            </div>
            <Link href="/items" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 rounded-xl transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105">
              Ver Todos
            </Link>
          </div>
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>}>
            <FeaturedItems />
          </Suspense>
        </div>
      </section>

      {/* How It Works Section - Enhanced */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-gray-900 mb-6">¿Cómo funciona Tolio?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              En tres simples pasos conecta con la comunidad y accede a servicios y herramientas
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-white font-black text-3xl">1</span>
              </div>
              <h3 className="text-2xl font-black mb-5 text-gray-900">Encontrá lo que necesitás</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Explorá miles de artículos y servicios disponibles en tu área. Usá filtros para encontrar exactamente lo que buscás.
              </p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-white font-black text-3xl">2</span>
              </div>
              <h3 className="text-2xl font-black mb-5 text-gray-900">Solicitá el servicio</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Seleccioná tus fechas y enviá una solicitud al prestador. Comunicáte a través de nuestro sistema de mensajería segura.
              </p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-white font-black text-3xl">3</span>
              </div>
              <h3 className="text-2xl font-black mb-5 text-gray-900">Coordina y disfrutá</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Encontráte con el prestador para recibir el servicio o retirar la herramienta. Calificá tu experiencia al finalizar.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Trust Section - More prominent */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-6">Construyendo confianza en la comunidad</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Sistema de verificación y reviews que genera confianza entre usuarios
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-black mb-6 text-gray-900">Sistema de confianza</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  En Tolio medimos la "confianza" en lugar de simples estrellas. Cada transacción exitosa 
                  aumenta tu nivel de confianza, creando una comunidad más segura para todos.
                </p>
              </div>
              <div className="space-y-5">
                <div className="flex items-start space-x-4 bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-800 text-lg font-semibold">Reviews honestas después de cada alquiler</span>
                </div>
                <div className="flex items-start space-x-4 bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-800 text-lg font-semibold">Verificación de identidad obligatoria</span>
                </div>
                <div className="flex items-start space-x-4 bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-800 text-lg font-semibold">Depósitos de seguridad opcionales</span>
                </div>
                <div className="flex items-start space-x-4 bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-800 text-lg font-semibold">Comunicación segura en la plataforma</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section - More impactful */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8 leading-tight">¿Listo para empezar<br />con Tolio?</h2>
          <p className="text-2xl text-white/95 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            Sumate a miles de usuarios que ya están ahorrando dinero y reduciendo residuos 
            al compartir en lugar de comprar.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/signup"
              className="bg-white text-emerald-600 hover:bg-gray-50 px-10 py-5 rounded-2xl font-black text-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Registrarte gratis
            </Link>
            <Link
              href="/items"
              className="bg-emerald-700 text-white hover:bg-emerald-800 border-2 border-white/30 px-10 py-5 rounded-2xl font-black text-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Explorar artículos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
