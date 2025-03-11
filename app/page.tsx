import Link from "next/link"
import { Search, TrendingUp, Clock, Shield } from "lucide-react"
import FeaturedItems from "@/components/featured-items"
import HeroSearch from "@/components/hero-search"
import CategoryList from "@/components/category-list"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-emerald-600 to-teal-500 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Pedí lo que necesitás, prestá lo que no!</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
          Accedé a miles de herramientas y artículos en tu comunidad sin el compromiso de propiedad.
          </p>

          <HeroSearch />

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
              <span className="text-sm">Ganá prestando</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Categoría</h2>
          <CategoryList />
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
          <FeaturedItems />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">¿Como funciona?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-emerald-600 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Encontrá lo que necesitás</h3>
              <p className="text-gray-600">
              Explorá miles de artículos disponibles en tu área. Usá filtros para encontrar exactamente lo que buscás.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-emerald-600 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Solicitá un préstamo </h3>
              <p className="text-gray-600">
              Seleccioná tus fechas y enviá una solicitud al propietario. Comunicate a través de nuestro sistema de mensajería segura.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-emerald-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Retiro y devolución</h3>
              <p className="text-gray-600">
              
              Encontrate con el propietario para retirar el artículo. Usalo durante el tiempo acordado y devolvelo en las mismas condiciones.              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-emerald-600">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">¿Listo para empezar?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
          Sumate a miles de usuarios que ya están ahorrando dinero y reduciendo residuos al pedir prestado en lugar de comprar.          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-emerald-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium text-lg"
            >
              Registráte ahora
            </Link>
            <Link
              href="/items"
              className="bg-emerald-700 text-white hover:bg-emerald-800 px-6 py-3 rounded-lg font-medium text-lg"
            >
              Explorá artículos
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

