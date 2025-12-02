"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { 
  ChevronLeft, Calendar, Clock, CheckCircle, XCircle, 
  User, MessageCircle, MapPin, Package, Briefcase,
  AlertCircle
} from "lucide-react"

interface BookingDetails {
  id: string
  status: string
  startDate: string
  endDate: string
  totalPrice: number
  createdAt: string
  updatedAt: string
  type: 'item' | 'service'
  item: {
    id: string
    title: string
    images: string[]
    price: number
    location?: string
  }
  borrower: {
    id: string
    firstName: string
    lastName: string
    profileImage: string | null
  }
  owner: {
    id: string
    firstName: string
    lastName: string
    profileImage: string | null
  }
  borrowerId: string
  ownerId: string
}

// Skeleton component
function BookingDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mb-6"></div>
        
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header con imagen y titulo */}
          <div className="p-5 flex items-start gap-4 border-b border-gray-100">
            <div className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-7 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>

          {/* Timeline simple */}
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse hidden sm:block"></div>
                  {i < 3 && <div className="flex-1 h-0.5 bg-gray-200 animate-pulse"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Info cards */}
          <div className="p-5 space-y-4">
            {/* Fechas */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="flex justify-between">
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Usuario */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Precio */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-7 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="p-5 bg-gray-50 border-t border-gray-100">
            <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchBooking()
    fetchCurrentUser()
  }, [params.id])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      if (data?.user?.id) {
        setCurrentUserId(data.user.id)
      }
    } catch (err) {
      console.error('Error fetching user:', err)
    }
  }

  const fetchBooking = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/booking/${params.id}`)
      
      if (!res.ok) {
        if (res.status === 404) {
          setError('Reserva no encontrada')
        } else {
          setError('Error al cargar la reserva')
        }
        return
      }
      
      const data = await res.json()
      setBooking(data)
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'confirm' | 'reject' | 'complete') => {
    if (!booking) return
    
    setActionLoading(true)
    try {
      const res = await fetch(`/api/booking/${booking.id}/${action}`, {
        method: 'PATCH'
      })
      
      if (res.ok) {
        await fetchBooking()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al procesar la acción')
      }
    } catch (err) {
      alert('Error de conexión')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <BookingDetailsSkeleton />
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error || 'Reserva no encontrada'}</h2>
          <Link href="/dashboard/bookings" className="text-blue-600 hover:underline">
            Volver a mis reservas
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = currentUserId === booking.ownerId
  const isBorrower = currentUserId === booking.borrowerId
  const otherUser = isOwner ? booking.borrower : booking.owner
  const isService = booking.type === 'service'
  
  const startDate = new Date(booking.startDate)
  const endDate = new Date(booking.endDate)
  const days = Math.max(1, differenceInDays(endDate, startDate))

  const statusConfig: Record<string, { color: string, bg: string, icon: React.ReactNode, label: string }> = {
    PENDING: { 
      color: 'text-amber-700', 
      bg: 'bg-amber-100', 
      icon: <Clock className="w-4 h-4" />, 
      label: 'Pendiente' 
    },
    CONFIRMED: { 
      color: 'text-blue-700', 
      bg: 'bg-blue-100', 
      icon: <CheckCircle className="w-4 h-4" />, 
      label: 'Confirmada' 
    },
    COMPLETED: { 
      color: 'text-green-700', 
      bg: 'bg-green-100', 
      icon: <CheckCircle className="w-4 h-4" />, 
      label: 'Completada' 
    },
    CANCELLED: { 
      color: 'text-red-700', 
      bg: 'bg-red-100', 
      icon: <XCircle className="w-4 h-4" />, 
      label: 'Cancelada' 
    }
  }

  const status = statusConfig[booking.status] || statusConfig.PENDING

  // Timeline steps
  const steps = [
    { key: 'PENDING', label: 'Solicitada', icon: <Clock className="w-5 h-5" /> },
    { key: 'CONFIRMED', label: 'Confirmada', icon: <CheckCircle className="w-5 h-5" /> },
    { key: 'COMPLETED', label: 'Completada', icon: <CheckCircle className="w-5 h-5" /> },
  ]

  const getStepStatus = (stepKey: string) => {
    const order = ['PENDING', 'CONFIRMED', 'COMPLETED']
    const currentIndex = order.indexOf(booking.status === 'CANCELLED' ? 'PENDING' : booking.status)
    const stepIndex = order.indexOf(stepKey)
    
    if (booking.status === 'CANCELLED') return 'cancelled'
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'upcoming'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back button */}
        <Link 
          href="/dashboard/bookings" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="font-medium">Mis reservas</span>
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={booking.item.images[0] || '/placeholder.jpg'}
                    alt={booking.item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-1 left-1">
                    <div className={`p-1 rounded ${isService ? 'bg-purple-600' : 'bg-blue-600'}`}>
                      {isService ? <Briefcase className="w-3 h-3 text-white" /> : <Package className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{booking.item.title}</h1>
                  <p className="text-sm text-gray-500">
                    {isService ? 'Servicio' : 'Artículo'} • ID: {booking.id.slice(0, 8)}
                  </p>
                  {booking.item.location && (
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {booking.item.location}
                    </p>
                  )}
                </div>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                {status.icon}
                {status.label}
              </div>
            </div>
          </div>

          {/* Timeline */}
          {booking.status !== 'CANCELLED' ? (
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between relative">
                {/* Progress line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ 
                      width: booking.status === 'PENDING' ? '0%' : 
                             booking.status === 'CONFIRMED' ? '50%' : 
                             booking.status === 'COMPLETED' ? '100%' : '0%' 
                    }}
                  />
                </div>
                
                {steps.map((step, index) => {
                  const stepStatus = getStepStatus(step.key)
                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        stepStatus === 'completed' ? 'bg-green-500 text-white' :
                        stepStatus === 'current' ? 'bg-blue-500 text-white ring-4 ring-blue-100' :
                        'bg-white border-2 border-gray-200 text-gray-400'
                      }`}>
                        {step.icon}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${
                        stepStatus === 'completed' || stepStatus === 'current' ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border-b border-red-100">
              <p className="text-center text-red-700 font-medium">
                <XCircle className="w-4 h-4 inline mr-2" />
                Esta reserva fue cancelada
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dates */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                <Calendar className="w-4 h-4 inline mr-2" />
                {isService ? 'Fecha' : 'Período'}
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                {isService ? (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {format(startDate, "d MMM yyyy", { locale: es })}
                    </p>
                    <p className="text-sm text-gray-500">Fecha programada</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {format(startDate, "d MMM", { locale: es })}
                      </p>
                      <p className="text-xs text-gray-500">Inicio</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center px-4">
                      <div className="h-px flex-1 bg-gray-300"></div>
                      <span className="px-3 text-sm font-semibold text-blue-600">{days} día{days > 1 ? 's' : ''}</span>
                      <div className="h-px flex-1 bg-gray-300"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {format(endDate, "d MMM", { locale: es })}
                      </p>
                      <p className="text-xs text-gray-500">Fin</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Other User */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                <User className="w-4 h-4 inline mr-2" />
                {isOwner ? (isService ? 'Cliente' : 'Inquilino') : (isService ? 'Prestador' : 'Propietario')}
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    {otherUser.profileImage ? (
                      <Image
                        src={otherUser.profileImage}
                        alt={`${otherUser.firstName} ${otherUser.lastName}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {otherUser.firstName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {otherUser.firstName} {otherUser.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isOwner ? (isService ? 'Cliente' : 'Inquilino') : (isService ? 'Prestador' : 'Propietario')}
                    </p>
                  </div>
                  <Link 
                    href={`/messages/${otherUser.id}`}
                    className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                💰 Resumen de pago
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isService ? 'Precio del servicio' : `$${booking.item.price} x ${days} día${days > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${booking.totalPrice?.toLocaleString() || (booking.item.price * days).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            {booking.status === 'PENDING' && isOwner && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center mb-4">
                  {otherUser.firstName} quiere {isService ? 'contratar tu servicio' : 'alquilar tu artículo'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction('confirm')}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Rechazar
                  </button>
                </div>
              </div>
            )}

            {booking.status === 'PENDING' && isBorrower && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-lg">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Esperando confirmación del {isService ? 'prestador' : 'propietario'}</span>
                </div>
              </div>
            )}

            {booking.status === 'CONFIRMED' && (
              <div className="space-y-3">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-blue-700 bg-blue-50 px-4 py-2 rounded-lg mb-4">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Reserva confirmada</span>
                  </div>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleAction('complete')}
                    disabled={actionLoading}
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Marcar como completada
                  </button>
                )}
              </div>
            )}

            {booking.status === 'COMPLETED' && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Reserva completada exitosamente</span>
                </div>
              </div>
            )}

            {/* Contact button always visible */}
            <div className="mt-4">
              <Link
                href={`/messages/${otherUser.id}`}
                className="w-full py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Enviar mensaje a {otherUser.firstName}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
