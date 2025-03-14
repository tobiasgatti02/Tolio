import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Package, Calendar, Star, Settings } from "lucide-react"

export const metadata: Metadata = {
  title: "Mis Reseñas | Prestar",
  description: "Gestiona tus reseñas de artículos",
}

// Datos de ejemplo para las reseñas
const reviews = [
  {
    id: "1",
    rating: 5,
    comment: "Excelente artículo, en perfectas condiciones. El propietario fue muy amable y servicial.",
    date: new Date("2023-11-20"),
    item: {
      id: "item1",
      title: "Taladro Profesional",
      images: ["/placeholder.svg?height=300&width=400"],
    },
    reviewer: {
      id: "user1",
      firstName: "María",
      lastName: "González",
      profileImage: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    id: "2",
    rating: 4,
    comment:
      "Muy buen artículo, aunque tenía algunos detalles menores de desgaste. La comunicación con el propietario fue excelente.",
    date: new Date("2023-11-15"),
    item: {
      id: "item2",
      title: "Cámara DSLR con Lentes",
      images: ["/placeholder.svg?height=300&width=400"],
    },
    reviewer: {
      id: "user2",
      firstName: "Juan",
      lastName: "Pérez",
      profileImage: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    id: "3",
    rating: 5,
    comment: "Todo perfecto, el artículo estaba como nuevo y funcionó perfectamente. Muy recomendable.",
    date: new Date("2023-11-05"),
    item: {
      id: "item3",
      title: "Bicicleta de Montaña",
      images: ["/placeholder.svg?height=300&width=400"],
    },
    reviewer: {
      id: "user3",
      firstName: "Pedro",
      lastName: "Sánchez",
      profileImage: "/placeholder.svg?height=100&width=100",
    },
  },
]

// Función para formatear fechas
const formatDate = (date: Date) => {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function ReviewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Panel de usuario</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <nav className="space-y-1">
              <Link href="/dashboard" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                <Package className="h-5 w-5 mr-2" />
                Mis artículos
              </Link>
              <Link
                href="/dashboard/bookings"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Mis reservas
              </Link>
              <Link
                href="/dashboard/reviews"
                className="flex items-center px-3 py-2 text-emerald-600 bg-emerald-50 rounded-md font-medium"
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
            <h2 className="text-xl font-bold mb-6">Reseñas recibidas</h2>

            {reviews.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No tienes reseñas</h3>
                <p className="text-gray-500">
                  Las reseñas aparecerán aquí cuando los usuarios califiquen tus artículos.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/5 relative h-32 md:h-auto">
                        <Image
                          src={review.item.images[0] || "/placeholder.svg"}
                          alt={review.item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4 md:p-6 flex-1">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{review.item.title}</h3>
                            <div className="flex items-center mb-2">
                              <div className="flex mr-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                            </div>
                            <div className="flex items-center mb-4">
                              <div className="relative h-6 w-6 rounded-full overflow-hidden mr-2">
                                <Image
                                  src={review.reviewer.profileImage || "/placeholder.svg"}
                                  alt={`${review.reviewer.firstName} ${review.reviewer.lastName}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <span className="text-sm text-gray-600">
                                {review.reviewer.firstName} {review.reviewer.lastName}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

