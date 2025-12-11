"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Calendar, Clock, CheckCircle, XCircle, 
  Filter, Search, Star, Eye, MessageCircle,
  TrendingUp, DollarSign, Package, Wrench
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DashboardBooking } from '@/lib/types'
import ReviewModal from "./review-modal"
import MaterialPaymentRequestForm from "@/components/material-payment-request-form"
import PaymentGateway from "@/components/payment-gateway"

interface BookingsStats {
  totalSpent: number
  activeBookings: number
  completedBookings: number
}

export default function BookingsClient({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<DashboardBooking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<DashboardBooking[]>([])
  const [stats, setStats] = useState<BookingsStats>({
    totalSpent: 0,
    activeBookings: 0,
    completedBookings: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<DashboardBooking | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showMaterialForm, setShowMaterialForm] = useState(false)
  const [selectedBookingForMaterials, setSelectedBookingForMaterials] = useState<string | null>(null)
  const [showPaymentGateway, setShowPaymentGateway] = useState(false)
  const [paymentData, setPaymentData] = useState<{ paymentId: string; checkoutUrl: string; amount: number } | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, activeFilter, searchTerm])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (bookingsData: DashboardBooking[]) => {
    // Filter bookings where current user is the borrower (has spent money)
    const userBookings = bookingsData.filter(booking => booking.userRole === 'borrower')
    
    const totalSpent = userBookings
      .filter(booking => booking.status === 'COMPLETED')
      .reduce((sum, booking) => sum + booking.total, 0)
    
    const activeBookings = bookingsData.filter(booking => 
      ['PENDING', 'CONFIRMED'].includes(booking.status)
    ).length
    
    const completedBookings = bookingsData.filter(booking => 
      booking.status === 'COMPLETED'
    ).length

    setStats({ totalSpent, activeBookings, completedBookings })
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // Aplicar filtro por estado
    if (activeFilter === 'active') {
      filtered = filtered.filter(booking => ['PENDING', 'CONFIRMED'].includes(booking.status))
    } else if (activeFilter === 'completed') {
      filtered = filtered.filter(booking => booking.status === 'COMPLETED')
    }

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.borrower?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.owner?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredBookings(filtered)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return {
          color: "bg-green-100 text-green-800",
          text: "Confirmado",
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
        }
      case "PENDING":
        return {
          color: "bg-yellow-100 text-yellow-800",
          text: "Pendiente",
          icon: <Clock className="w-4 h-4 mr-1" />,
        }
      case "CANCELLED":
        return {
          color: "bg-red-100 text-red-800",
          text: "Cancelado",
          icon: <XCircle className="w-4 h-4 mr-1" />,
        }
      case "COMPLETED":
        return {
          color: "bg-blue-100 text-blue-800",
          text: "Completado",
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
        }
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          text: status,
          icon: null,
        }
    }
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, "d 'de' MMMM, yyyy", { locale: es })
  }

  const openReviewModal = (booking: DashboardBooking) => {
    setSelectedBooking(booking)
    setShowReviewModal(true)
  }

  const closeReviewModal = () => {
    setSelectedBooking(null)
    setShowReviewModal(false)
    fetchBookings() // Refresh data after review
  }

  const handleBookingAction = async (bookingId: string, action: 'confirm' | 'reject') => {
    try {
      const response = await fetch(`/api/booking/${bookingId}/${action}`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        // Refrescar las reservas
        fetchBookings()
        alert(`Reserva ${action === 'confirm' ? 'confirmada' : 'rechazada'} exitosamente`)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.message || 'No se pudo procesar la reserva'}`)
      }
    } catch (error) {
      console.error('Error processing booking:', error)
      alert('Error al procesar la reserva')
    }
  }

  const openMaterialsForm = (bookingId: string) => {
    setSelectedBookingForMaterials(bookingId)
    setShowMaterialForm(true)
  }

  const handleMaterialsSubmit = async (materials: { name: string; price: number }[]) => {
    if (!selectedBookingForMaterials) return

    try {
      const response = await fetch('/api/payments/materials/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBookingForMaterials,
          materials,
        }),
      })

      if (response.ok) {
        alert('Solicitud de materiales enviada exitosamente')
        setShowMaterialForm(false)
        setSelectedBookingForMaterials(null)
        fetchBookings() // Refresh to update status
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'No se pudo enviar la solicitud'}`)
      }
    } catch (error) {
      console.error('Error requesting materials:', error)
      alert('Error al solicitar materiales')
    }
  }

  const initializeServicePayment = async (bookingId: string) => {
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          type: 'SERVICE',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentData({
          paymentId: data.paymentId,
          checkoutUrl: data.checkoutUrl,
          amount: data.amount,
        })
        setShowPaymentGateway(true)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'No se pudo iniciar el pago'}`)
      }
    } catch (error) {
      console.error('Error initializing payment:', error)
      alert('Error al iniciar el pago')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-72 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter controls skeleton */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Artículo', 'Fechas', 'Usuario', 'Monto', 'Estado', 'Acciones'].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="ml-4">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="ml-3">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header y estadísticas */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Reservas</h1>
        <p className="text-gray-600">Gestiona todas tus reservas y alquileres</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Gastado</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reservas Activas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controles de filtro */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Filtros por estado */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'Todas' },
                { key: 'active', label: 'Activas' },
                { key: 'completed', label: 'Completadas' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar reservas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Lista de reservas */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reservas</h3>
            <p className="text-gray-600">
              {activeFilter === 'all' 
                ? 'Aún no tienes reservas registradas.'
                : `No tienes reservas ${activeFilter === 'active' ? 'activas' : 'completadas'}.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artículo / Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => {
                  const statusInfo = getStatusInfo(booking.status)
                  const isOwner = booking.userRole === 'owner'
                  const otherUser = isOwner ? booking.borrower : booking.owner
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={booking.item.imagenes[0] || '/placeholder.jpg'}
                              alt={booking.item.nombre}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.item.nombre}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.type === 'service' ? (
                                <span className="text-purple-600">Servicio</span>
                              ) : booking.item.precioPorDia > 0 ? (
                                <>${booking.item.precioPorDia}/día</>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(booking.fechaInicio)}
                        </div>
                        {booking.type !== 'service' && booking.fechaInicio !== booking.fechaFin && (
                          <div className="text-sm text-gray-500">
                            hasta {formatDate(booking.fechaFin)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            {otherUser ? (
                              <>
                                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                  {otherUser.name.charAt(0).toUpperCase()}
                                </div>
                              </>
                            ) : (
                              <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm font-medium">
                                ?
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {otherUser?.name || 'Usuario no disponible'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {isOwner ? 'Prestatario' : 'Prestador'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.total > 0 ? `$${booking.total.toLocaleString()}` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link 
                            href={`/dashboard/bookings/${booking.id}`} 
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                            title="Ver detalles de la reserva"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Reserva
                          </Link>
                          
                          {/* Botones para propietario con reserva pendiente */}
                          {isOwner && booking.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'confirm')}
                                className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                                title="Aceptar reserva"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Aceptar
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'reject')}
                                className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                                title="Rechazar reserva"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Rechazar
                              </button>
                            </>
                          )}

                          {/* Botón para solicitar materiales - solo para servicios confirmados */}
                          {isOwner && booking.type === 'service' && booking.status === 'CONFIRMED' && booking.mayIncludeMaterials && !booking.materialsPaid && (
                            <button
                              onClick={() => openMaterialsForm(booking.id)}
                              className="inline-flex items-center px-3 py-1 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700"
                              title="Solicitar pago de materiales"
                            >
                              <Wrench className="w-4 h-4 mr-1" />
                              Materiales
                            </button>
                          )}

                          {/* Botón para pagar servicio - solo para cliente cuando el servicio está completado */}
                          {!isOwner && booking.type === 'service' && booking.status === 'COMPLETED' && !booking.servicePaid && (
                            <button
                              onClick={() => initializeServicePayment(booking.id)}
                              className="inline-flex items-center px-3 py-1 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
                              title="Pagar servicio completado"
                            >
                              <DollarSign className="w-4 h-4 mr-1" />
                              Pagar
                            </button>
                          )}

                          {booking.canReview && !booking.hasReviewed && (
                            <button
                              onClick={() => openReviewModal(booking)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Calificar"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          {otherUser?.id && (
                            <Link 
                              href={`/messages/${otherUser.id}`} 
                              className="text-gray-600 hover:text-gray-900" 
                              title={`Enviar mensaje a ${otherUser.name}`}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de reseña */}
      {showReviewModal && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          userId={userId}
          onClose={closeReviewModal}
        />
      )}

      {/* Modal de solicitud de materiales */}
      {showMaterialForm && selectedBookingForMaterials && (
        <MaterialPaymentRequestForm
          bookingId={selectedBookingForMaterials}
          onSubmit={handleMaterialsSubmit}
          onCancel={() => {
            setShowMaterialForm(false)
            setSelectedBookingForMaterials(null)
          }}
        />
      )}

      {/* Modal de pago de servicio */}
      {showPaymentGateway && paymentData && (
        <PaymentGateway
          paymentId={paymentData.paymentId}
          checkoutUrl={paymentData.checkoutUrl}
          amount={paymentData.amount}
          type="service"
          onSuccess={() => {
            setShowPaymentGateway(false)
            setPaymentData(null)
            fetchBookings() // Refresh to update payment status
          }}
          onCancel={() => {
            setShowPaymentGateway(false)
            setPaymentData(null)
          }}
        />
      )}
    </div>
  )
}
