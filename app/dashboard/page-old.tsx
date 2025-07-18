import type { Metadata } from "next"
import Link from "next/link"
import { Plus, Package, Calendar, Star, Settings, PenTool } from "lucide-react"


export const metadata: Metadata = {
  title: "Panel de usuario | Tolio",
  description: "Gestiona tus artículos y reservas",
}

export default function DashboardPage({ searchParams }: { searchParams: { itemCreated?: string } }) {
  const showSuccessMessage = searchParams.itemCreated === "true"

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Panel de usuario</h1>

      {showSuccessMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p>¡Tu artículo ha sido publicado con éxito! Pronto estará disponible para préstamo.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <nav className="space-y-1">
              <Link href="/dashboard" className="flex items-center px-3 py-2 text-emerald-600 bg-emerald-50 rounded-md font-medium">
                <Package className="h-5 w-5 mr-2" />
                Publicar
              </Link>
              <Link href="/dashboard/my-items" className="flex items-center px-3 py-2  text-gray-700 hover:bg-gray-50 rounded-md">
                <PenTool className="h-5 w-5 mr-2" />
                Mis artículos
              </Link>

              <Link
                href="/dashboard/bookings"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md" >
                <Calendar className="h-5 w-5 mr-2" />
                Mis reservas
              </Link>
              <Link
                href="/dashboard/reviews"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <Star className="h-5 w-5 mr-2" />
                Reseñas
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <Settings className="h-5 w-5 mr-2" />
                Configuración
              </Link>
            </nav>
          </div>
        </div>
        {/* Main content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Mis artículos</h2>
              <Link
                href="/items/create"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="h-5 w-5 mr-1" />
                Publicar artículo
              </Link>
            </div>

            {/* Placeholder for items list */}
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No tienes artículos publicados</h3>
              <p className="text-gray-500 mb-4">Comienza a ganar dinero prestando tus artículos.</p>
              <Link
                href="/items/nuevo"
                className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="h-5 w-5 mr-1" />
                Publicar artículo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

