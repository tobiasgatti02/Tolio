import Link from "next/link"
import { Search, TrendingUp, Clock, Shield, Wrench, Briefcase, MapPin, Star, Users, CheckCircle2 } from "lucide-react"
import FeaturedItems from "@/components/featured-items"
import HeroSearch from "@/components/hero-search"
import CategoryList from "@/components/category-list"
import { Suspense } from "react"

export default function Home() {
  return (
    <div className="flex flex-col scroll-smooth">
      {/* Hero Section - Full Viewport Height */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-12 overflow-hidden">
        {/* Animated Background Elements */}
        
        <div className="max-w-7xl mx-auto text-center relative z-10 w-full">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white mb-6 md:mb-8 drop-shadow-2xl leading-tight animate-fade-in-up">
            Conecta con Oficios<br />y Herramientas
          </h1>
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-10 md:mb-16 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200 px-2">
            Publicá tu servicio, ofrecé herramientas o encontrá lo que necesitás en tu comunidad
          </p>
          {/* Main Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center mb-12 md:mb-20 animate-fade-in-up animation-delay-400 px-2">
            <Link 
              href="/services"
              className="group relative bg-white hover:bg-gray-50 text-gray-900 px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-8 rounded-2xl md:rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 w-full md:w-auto md:min-w-[400px]">
              <div className="flex items-center justify-center space-x-3 sm:space-x-4 md:space-x-5">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 sm:p-4 md:p-5 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                  <Briefcase className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-0.5 md:mb-1">Buscar Servicios</h3>
                  <p className="text-gray-600 text-sm md:text-base">Plomeros, electricistas, pintores...</p>
                </div>
              </div>
            </Link>
            <Link 
              href="/items"
              className="group relative bg-white hover:bg-gray-50 text-gray-900 px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-8 rounded-2xl md:rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 w-full md:w-auto md:min-w-[400px]">
              <div className="flex items-center justify-center space-x-3 sm:space-x-4 md:space-x-5">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 sm:p-4 md:p-5 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                  <Wrench className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-0.5 md:mb-1">Alquilar Herramientas</h3>
                  <p className="text-gray-600 text-sm md:text-base">Taladros, escaleras, equipos...</p>
                </div>
              </div>
            </Link>
          </div>
          {/* Feature Icons */}
          <div className="mt-8 md:mt-16 grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-white animate-fade-in-up animation-delay-600 px-2">
            <div className="flex flex-col items-center space-y-2 md:space-y-4 hover:scale-110 transition-transform duration-300">
              <div className="bg-white/20 backdrop-blur-sm p-3 md:p-4 rounded-xl md:rounded-2xl mb-1 md:mb-2 shadow-lg">
                <Search className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
              </div>
              <span className="text-xs sm:text-sm md:text-lg font-semibold text-center">Busca oficios</span>
            </div>
            <div className="flex flex-col items-center space-y-2 md:space-y-4 hover:scale-110 transition-transform duration-300">
              <div className="bg-white/20 backdrop-blur-sm p-3 md:p-4 rounded-xl md:rounded-2xl mb-1 md:mb-2 shadow-lg">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
              </div>
              <span className="text-xs sm:text-sm md:text-lg font-semibold text-center">Conecta directo</span>
            </div>
            <div className="flex flex-col items-center space-y-2 md:space-y-4 hover:scale-110 transition-transform duration-300">
              <div className="bg-white/20 backdrop-blur-sm p-3 md:p-4 rounded-xl md:rounded-2xl mb-1 md:mb-2 shadow-lg">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
              </div>
              <span className="text-xs sm:text-sm md:text-lg font-semibold text-center">Comunidad confiable</span>
            </div>
           
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          
        </div>
      </section>

      {/* How It Works Section - Full Viewport Height */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-20 bg-gradient-to-br from-blue-50 via-white to-orange-50 overflow-hidden">
        {/* Animated Icons Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center mb-10 md:mb-20 px-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 md:mb-6">¿Cómo funciona Tolio?</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              En tres simples pasos conecta con la comunidad y accede a servicios y herramientas
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 px-2">
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105 hover:-translate-y-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg animate-pulse-slow">
                <span className="text-white font-black text-xl sm:text-2xl md:text-3xl">1</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-3 md:mb-5 text-gray-900">Encontrá lo que necesitás</h3>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                Explorá miles de artículos y servicios disponibles en tu área. Usá filtros para encontrar exactamente lo que buscás.
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105 hover:-translate-y-2 animation-delay-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg animate-pulse-slow animation-delay-200">
                <span className="text-white font-black text-xl sm:text-2xl md:text-3xl">2</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-3 md:mb-5 text-gray-900">Solicitá el servicio</h3>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                Seleccioná tus fechas y enviá una solicitud al prestador. Comunicáte a través de nuestro sistema de mensajería segura.
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105 hover:-translate-y-2 animation-delay-400">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg animate-pulse-slow animation-delay-400">
                <span className="text-white font-black text-xl sm:text-2xl md:text-3xl">3</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-3 md:mb-5 text-gray-900">Coordina y disfrutá</h3>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                Encontráte con el prestador para recibir el servicio o retirar la herramienta. Calificá tu experiencia al finalizar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Section - Full Viewport Height */}
      <section className="relative min-h-screen flex items-center justify-center py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-white overflow-hidden">
        {/* Decorative Elements */}
       

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

      {/* Trust Section - Full Viewport Height */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-20 bg-gradient-to-br from-emerald-50 via-white to-blue-50 overflow-hidden">
        {/* Animated Trust Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        </div>

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
                  En Tolio medimos la "confianza" en lugar de simples estrellas. Cada transacción exitosa 
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

      {/* CTA Section - Full Viewport Height */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-20 bg-gradient-to-r from-emerald-600 to-teal-600 overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 md:left-20 w-64 md:w-96 h-64 md:h-96 bg-teal-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 md:right-20 w-56 md:w-80 h-56 md:h-80 bg-emerald-400/20 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-white/5 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10 px-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 md:mb-8 leading-tight">¿Listo para empezar<br />con Tolio?</h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            Sumate a miles de usuarios que ya están ahorrando dinero y reduciendo residuos 
            al compartir en lugar de comprar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center px-4 sm:px-0">
            <Link
              href="/signup"
              className="bg-white text-emerald-600 hover:bg-gray-50 px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base sm:text-lg md:text-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Registrarte gratis
            </Link>
            <Link
              href="/items"
              className="bg-emerald-700 text-white hover:bg-emerald-800 border-2 border-white/30 px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base sm:text-lg md:text-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Explorar artículos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
