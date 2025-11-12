import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
  Calendar, Clock, CheckCircle, XCircle, Package,
  Eye, MessageSquare, Star, Filter, Search
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export const metadata = {
  title: "Mis Reservas | Tolio",
  description: "Gestiona tus reservas de artículos",
}

// Función para formatear fechas
const formatDate = (date: Date) => {
  return format(date, "d 'de' MMMM, yyyy", { locale: es })
}

// Función para obtener el color y texto según el estado
const getStatusInfo = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return {
        color: "bg-green-100 text-green-800",
        text: "Confirmado",
        icon: <CheckCircle className="h-4 w-4" />,
      }
    case "PENDING":
      return {
        color: "bg-yellow-100 text-yellow-800",
        text: "Pendiente",
        icon: <Clock className="h-4 w-4" />,
      }
    case "COMPLETED":
      return {
        color: "bg-blue-100 text-blue-800",
        text: "Completado",
        icon: <CheckCircle className="h-4 w-4" />,
      }
    case "CANCELLED":
      return {
        color: "bg-red-100 text-red-800",
        text: "Cancelado",
        icon: <XCircle className="h-4 w-4" />,
      }
    default:
      return {
        color: "bg-gray-100 text-gray-800",
        text: status,
        icon: <Clock className="h-4 w-4" />,
      }
  }
}

// Función simulada para obtener reservas del usuario
async function getUserBookings(userId: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/dashboard/bookings`, {
      cache: 'no-store'
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching user bookings:', error)
  }
  return []
}

export default async function BookingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/bookings")
  }
  
  const userId = session.user.id
  const bookings = await getUserBookings(userId)

  const activeBookings = bookings.filter((b: any) => ['CONFIRMED', 'PENDING'].includes(b.status))
  const completedBookings = bookings.filter((b: any) => b.status === 'COMPLETED')
  const cancelledBookings = bookings.filter((b: any) => b.status === 'CANCELLED')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis reservas</h1>
          <p className="text-gray-600">Gestiona todas tus reservas y alquileres</p>
        </div>
        <Link
          href="/items"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Buscar artículos</span>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total reservas</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activas</p>
              <p className="text-2xl font-bold text-gray-900">{activeBookings.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-gray-900">{completedBookings.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total gastado</p>
              <p className="text-2xl font-bold text-gray-900">
                ${bookings.reduce((sum: number, booking: any) => sum + (booking.totalAmount || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
              Todas ({bookings.length})
            </button>
            <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
              Activas ({activeBookings.length})
            </button>
            <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
              Completadas ({completedBookings.length})
            </button>
          </nav>
        </div>

        {/* Bookings list */}
        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reservas</h3>
            <p className="text-gray-600 mb-6">Explora artículos disponibles y haz tu primera reserva</p>
            <Link
              href="/items"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Explorar artículos</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bookings.map((booking: any) => (
              <div key={booking.id} className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Item image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {booking.item?.images && booking.item.images.length > 0 ? (
                      <Image
                        src={booking.item.images[0]}
                        alt={booking.item.title}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Booking details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.item?.title || 'Artículo no disponible'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Propietario: {booking.item?.owner?.name || 'No disponible'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>
                            {formatDate(new Date(booking.startDate))} - {formatDate(new Date(booking.endDate))}
                          </span>
                          <span>${booking.totalAmount?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusInfo(booking.status).color}`}>
                          {getStatusInfo(booking.status).icon}
                          <span className="ml-1">{getStatusInfo(booking.status).text}</span>
                        </span>
                      </div>
                    </div>

                    {/* Payment status */}
                    {booking.paymentStatus && (
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Pago:</span>
                        <span className={`text-sm font-medium ${
                          booking.paymentStatus === 'PAID' || booking.paymentStatus === 'COMPLETED' 
                            ? 'text-green-600' 
                            : booking.paymentStatus === 'PENDING' 
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {booking.paymentStatus === 'PAID' && 'Pagado'}
                          {booking.paymentStatus === 'PENDING' && 'Pendiente'}
                          {booking.paymentStatus === 'COMPLETED' && 'Completado'}
                          {booking.paymentStatus === 'FAILED' && 'Falló'}
                          {booking.paymentStatus === 'REFUNDED' && 'Reembolsado'}
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center space-x-3 mt-4">
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver detalles</span>
                      </Link>
                      
                      <Link
                        href={`/items/${booking.item?.id}`}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        <span>Ver artículo</span>
                      </Link>

                      {booking.status === 'COMPLETED' && (
                        <button className="flex items-center space-x-1 px-3 py-1.5 text-sm text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                          <Star className="w-4 h-4" />
                          <span>Calificar</span>
                        </button>
                      )}

                      {booking.status === 'PENDING' && (
                        <button className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                          <XCircle className="w-4 h-4" />
                          <span>Cancelar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
