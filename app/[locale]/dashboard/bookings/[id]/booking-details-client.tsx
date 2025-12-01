"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  AlertCircle,
  Package
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"

interface BookingDetails {
  id: string
  startDate: string
  endDate: string
  totalAmount: number
  deposit: number
  status: string
  createdAt: string
  userRole: 'owner' | 'borrower'
  item: {
    id: string
    name: string
    description: string
    images: string[]
    pricePerDay: number
    location: string
  }
  borrower?: {
    id: string
    firstName: string
    lastName: string
    email: string
    profileImage: string | null
  }
  owner?: {
    id: string
    firstName: string
    lastName: string
    email: string
    profileImage: string | null
  }
}

interface BookingDetailsClientProps {
  bookingId: string
}

export default function BookingDetailsClient({ bookingId }: BookingDetailsClientProps) {
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/dashboard/bookings/${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        setBooking(data)
      } else if (response.status === 404) {
        router.push('/dashboard/bookings')
      }
    } catch (error) {
      console.error('Error fetching booking details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingAction = async (action: 'confirm' | 'reject') => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/booking/${bookingId}/${action}`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        await fetchBookingDetails() // Refresh booking data
        alert(`Reserva ${action === 'confirm' ? 'confirmada' : 'rechazada'} exitosamente`)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.message || 'No se pudo procesar la reserva'}`)
      }
    } catch (error) {
      console.error('Error processing booking:', error)
      alert('Error al procesar la reserva')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pendiente
          </span>
        )
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Confirmada
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Cancelada
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Completada
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es })
  }

  const calculateDays = () => {
    if (!booking) return 0
    const start = new Date(booking.startDate)
    const end = new Date(booking.endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Reserva no encontrada</h2>
          <p className="text-gray-600 mb-4">La reserva que buscas no existe o no tienes permiso para verla.</p>
          <Link href="/dashboard/bookings" className="text-emerald-600 hover:text-emerald-700">
            Volver a mis reservas
          </Link>
        </div>
      </div>
    )
  }

  const otherUser = booking.userRole === 'owner' ? booking.borrower : booking.owner
  const days = calculateDays()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link href="/dashboard/bookings" className="mr-4 p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Detalles de la Reserva</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estado y Acciones */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Estado de la Reserva</h2>
                {getStatusBadge(booking.status)}
              </div>
              <div className="text-sm text-gray-500">
                ID: {booking.id.slice(0, 8)}...
              </div>
            </div>

            {/* Acciones para propietario */}
            {booking.userRole === 'owner' && booking.status === 'PENDING' && (
              <div className="border-t pt-4">
                <h3 className="text-md font-medium text-gray-900 mb-3">Acciones Pendientes</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleBookingAction('confirm')}
                    disabled={actionLoading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {actionLoading ? 'Procesando...' : 'Aceptar Reserva'}
                  </button>
                  <button
                    onClick={() => handleBookingAction('reject')}
                    disabled={actionLoading}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {actionLoading ? 'Procesando...' : 'Rechazar Reserva'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Información del Artículo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Artículo</h2>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Image
                  src={booking.item.images[0] || '/placeholder.jpg'}
                  alt={booking.item.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{booking.item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{booking.item.description}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  {booking.item.location}
                </div>
                <div className="flex items-center mt-1 text-sm font-medium text-emerald-600">
                  <DollarSign className="w-4 h-4 mr-1" />
                  ${booking.item.pricePerDay}/día
                </div>
              </div>
            </div>
          </div>

          {/* Fechas y Duración */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Fechas de Alquiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de inicio</p>
                  <p className="font-medium">{formatDate(booking.startDate)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de fin</p>
                  <p className="font-medium">{formatDate(booking.endDate)}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">Duración total</p>
              <p className="font-medium">{days} día{days !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Información del Usuario */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {booking.userRole === 'owner' ? 'Prestatario' : 'Propietario'}
            </h2>
            {otherUser && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    {otherUser.profileImage ? (
                      <Image
                        src={otherUser.profileImage}
                        alt={`${otherUser.firstName} ${otherUser.lastName}`}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {otherUser.firstName} {otherUser.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{otherUser.email}</p>
                  </div>
                </div>
                <Link
                  href={`/messages/${otherUser.id}`}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar mensaje
                </Link>
              </div>
            )}
          </div>

          {/* Resumen de Costos */}
          

          {/* Información Adicional */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Creada el:</span>
                <span>{formatDate(booking.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tu rol:</span>
                <span className="capitalize">{booking.userRole === 'owner' ? 'Propietario' : 'Prestatario'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
