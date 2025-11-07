import { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Plus, MapPin, Filter, Briefcase } from "lucide-react"

export const metadata: Metadata = {
  title: "Servicios Profesionales | Tolio",
  description: "Encuentra profesionales para tus proyectos y changas",
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Servicios Profesionales</h1>
              <p className="text-blue-100 text-lg">
                Encuentra el profesional ideal para tu proyecto
              </p>
            </div>
            <Link
              href="/services/nuevo"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Ofrecer Servicio
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </h3>
              
              <div className="space-y-4">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Ubicación
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Palermo, CABA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Todas las categorías</option>
                    <option value="construccion">Construcción</option>
                    <option value="electricidad">Electricidad</option>
                    <option value="plomeria">Plomería</option>
                    <option value="pintura">Pintura</option>
                    <option value="jardineria">Jardinería</option>
                    <option value="limpieza">Limpieza</option>
                    <option value="mudanzas">Mudanzas</option>
                    <option value="tecnologia">Tecnología</option>
                  </select>
                </div>

                {/* Price Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Precio
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-blue-600 mr-2" />
                      <span className="text-sm">Por hora</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-blue-600 mr-2" />
                      <span className="text-sm">Precio a convenir</span>
                    </label>
                  </div>
                </div>

                {/* Professional Badge Filter */}
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600 mr-2" />
                    <span className="text-sm font-medium">Solo matriculados</span>
                  </label>
                </div>

                {/* Map Toggle */}
                <button className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Ver en Mapa
                </button>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">0</span> servicios encontrados
              </p>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="relevance">Más relevantes</option>
                <option value="rating">Mejor valorados</option>
                <option value="price-low">Precio: menor a mayor</option>
                <option value="price-high">Precio: mayor a menor</option>
                <option value="distance">Más cercanos</option>
              </select>
            </div>

            {/* Placeholder - will be replaced with actual service cards */}
            <div className="text-center py-20 bg-white rounded-lg">
              <Briefcase className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay servicios disponibles aún
              </h3>
              <p className="text-gray-600 mb-6">
                Sé el primero en ofrecer tus servicios profesionales
              </p>
              <Link
                href="/services/nuevo"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Ofrecer mi Servicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
