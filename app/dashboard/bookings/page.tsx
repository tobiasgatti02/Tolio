import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Package, Calendar, Star, Settings, Clock, CheckCircle, XCircle } from "lucide-react"
import { getBookings } from "@/app/api/booking/route"

export const metadata: Metadata = {
  title: "Mis Reservas | Prestar",
  description: "Gestiona tus reservas de artículos",
}




// Función para formatear fechas
const formatDate = (date: Date) => {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// Función para obtener el color y texto según el estado
const getStatusInfo = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return {
        color: "bg-green-100 text-green-800",
        text: "Confirmado",
        icon: <CheckCircle className="h-4 w-4 mr-1" />,
      }
    case "PENDING":
      return {
        color: "bg-yellow-100 text-yellow-800",
        text: "Pendiente",
        icon: <Clock className="h-4 w-4 mr-1" />,
      }
    case "COMPLETED":
      return {
        color: "bg-blue-100 text-blue-800",
        text: "Completado",
        icon: <CheckCircle className="h-4 w-4 mr-1" />,
      }
    case "CANCELLED":
      return {
        color: "bg-red-100 text-red-800",
        text: "Cancelado",
        icon: <XCircle className="h-4 w-4 mr-1" />,
      }
    default:
      return {
        color: "bg-gray-100 text-gray-800",
        text: "Desconocido",
        icon: null,
      }
  }
}

export default async function BookingsPage() {
  const bookings = await getBookings()
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
                className="flex items-center px-3 py-2 text-emerald-600 bg-emerald-50 rounded-md font-medium"
              >
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
            <h2 className="text-xl font-bold mb-6">Mis reservas</h2>

            {bookings.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No tienes reservas</h3>
                <p className="text-gray-500 mb-4">Explora artículos disponibles para reservar.</p>
                <Link
                  href="/items"
                  className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
                >
                  Explorar artículos
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => {
                  const statusInfo = getStatusInfo(booking.status)

                  return (
                    <div key={booking.id} className="border rounded-lg overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 relative h-48 md:h-auto">
                          <Image
                            src={booking.item.images[0] || "/placeholder.svg"}
                            alt={booking.item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4 md:p-6 flex-1">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">{booking.item.title}</h3>
                              <div className="flex items-center text-sm text-gray-500 mb-2">
                                <span className="mr-3">${booking.item.price}/día</span>
                                <span>
                                  {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                </span>
                              </div>
                              <div className="flex items-center mb-4">
                                <div className="relative h-6 w-6 rounded-full overflow-hidden mr-2">
                                  <Image
                                    src={booking.owner.profileImage || "/placeholder.svg"}
                                    alt={`${booking.owner.firstName} ${booking.owner.lastName}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <span className="text-sm text-gray-600">
                                  {booking.owner.firstName} {booking.owner.lastName}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div
                                className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color} mb-2`}
                              >
                                {statusInfo.icon}
                                {statusInfo.text}
                              </div>
                              <div className="text-lg font-bold text-gray-900">${booking.totalPrice.toFixed(2)}</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-auto">
                            <Link
                              href={`/bookings/${booking.id}`}
                              className="text-emerald-600 hover:text-emerald-800 border border-emerald-600 px-4 py-2 rounded-lg text-sm font-medium"
                            >
                              Ver detalles
                            </Link>
                            {booking.status === "COMPLETED"  && (
                              <Link
                                href={`/reviews/create?bookingId=${booking.id}`}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                              >
                                Dejar reseña
                              </Link>
                            )}
                            {booking.status === "PENDING" && (
                              <button className="text-red-600 hover:text-red-800 border border-red-600 px-4 py-2 rounded-lg text-sm font-medium">
                                Cancelar reserva
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

