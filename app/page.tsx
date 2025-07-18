import Link from "next/link"
import { Search, TrendingUp, Clock, Shield } from "lucide-react"
import FeaturedItems from "@/components/featured-items"
import HeroSearch from "@/components/hero-search"
import CategoryList from "@/components/category-list"
import { Suspense } from "react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-emerald-600 to-teal-500 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Alquilá lo que necesitás, ofrecé lo que no usás!
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Accedé a miles de herramientas y artículos en tu comunidad con Tolio, 
            la plataforma de confianza para alquileres entre personas.
          </p>

          <Suspense fallback={<div className="h-16 bg-white/20 rounded-lg animate-pulse" />}>
            <HeroSearch />
          </Suspense>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
            <div className="flex flex-col items-center">
              <div className="bg-white/20 p-3 rounded-full mb-3">
                <Search className="h-6 w-6" />
              </div>
              <span className="text-sm">Encontrá lo que querés</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/20 p-3 rounded-full mb-3">
                <Clock className="h-6 w-6" />
              </div>
              <span className="text-sm">Tiempo flexible</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/20 p-3 rounded-full mb-3">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-sm">Transacciones seguras</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/20 p-3 rounded-full mb-3">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="text-sm">Ganá alquilando</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Categorías populares</h2>
          <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>}>
            <CategoryList />
          </Suspense>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Artículos destacados</h2>
            <Link href="/items" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Ver Todos
            </Link>
          </div>
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>}>
            <FeaturedItems />
          </Suspense>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">¿Cómo funciona Tolio?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-emerald-600 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Encontrá lo que necesitás</h3>
              <p className="text-gray-600">
                Explorá miles de artículos disponibles en tu área. Usá filtros para encontrar exactamente lo que buscás.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-emerald-600 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Solicitá el alquiler</h3>
              <p className="text-gray-600">
                Seleccioná tus fechas y enviá una solicitud al propietario. Comunicáte a través de nuestro sistema de mensajería segura.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-emerald-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Retiro y devolución</h3>
              <p className="text-gray-600">
                Encontráte con el propietario para retirar el artículo. Úsalo durante el tiempo acordado y devolvélo en las mismas condiciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Construyendo confianza en la comunidad</h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Sistema de confianza</h3>
              <p className="text-gray-600 mb-6">
                En Tolio medimos la "confianza" en lugar de simples estrellas. Cada transacción exitosa 
                aumenta tu nivel de confianza, creando una comunidad más segura para todos.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Reviews honestas después de cada alquiler</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Verificación de identidad obligatoria</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Depósitos de seguridad opcionales</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Comunicación segura en la plataforma</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl">
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">95%</div>
                <p className="text-gray-600 mb-4">de los alquileres se completan exitosamente</p>
                
                <div className="text-4xl font-bold text-emerald-600 mb-2">4.8/5</div>
                <p className="text-gray-600 mb-4">promedio de confianza en la comunidad</p>
                
                <div className="text-4xl font-bold text-emerald-600 mb-2">24hs</div>
                <p className="text-gray-600">tiempo promedio de respuesta</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-emerald-600">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">¿Listo para empezar con Tolio?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Sumate a miles de usuarios que ya están ahorrando dinero y reduciendo residuos 
            al alquilar en lugar de comprar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-emerald-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Registrarte gratis
            </Link>
            <Link
              href="/items"
              className="bg-emerald-700 text-white hover:bg-emerald-800 px-6 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Explorar artículos
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
