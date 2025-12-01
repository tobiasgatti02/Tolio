"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Calendar, Clock, CheckCircle, XCircle, AlertTriangle,
  Filter, Search, Star, Eye, MessageCircle, Package,
  Wrench, Briefcase, ChevronRight, Timer
} from "lucide-react"
import { format, differenceInDays, differenceInWeeks, isPast, isFuture, isToday, addDays } from "date-fns"
import { es } from "date-fns/locale"
import ReviewModal from "./review-modal"

interface BookingItem {
  id: string
  nombre: string
  imagenes: string[]
  precioPorDia: number
  type?: 'item' | 'service'
}

interface BookingUser {
  id: string
  name: string
  email: string
}

interface Booking {
  id: string
  item: BookingItem
  borrower?: BookingUser
  owner?: BookingUser
  fechaInicio: string
  fechaFin: string
  total: number
  status: 'PENDIENTE' | 'CONFIRMADA' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA'
  createdAt: string
  canReview: boolean
  hasReviewed: boolean
  userRole: 'borrower' | 'owner'
}

interface BookingsStats {
  totalSpent: number
  activeBookings: number
  completedBookings: number
  pendingBookings: number
}

export default function BookingsClientEnhanced({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<BookingsStats>({
    totalSpent: 0,
    activeBookings: 0,
    completedBookings: 0,
    pendingBookings: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'items' | 'services'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, activeFilter, typeFilter, searchTerm])

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

  const calculateStats = (bookingsData: Booking[]) => {
    const userBookings = bookingsData.filter(booking => booking.userRole === 'borrower')
    
    const totalSpent = userBookings
      .filter(booking => booking.status === 'COMPLETADA')
      .reduce((sum, booking) => sum + booking.total, 0)
    
    const activeBookings = bookingsData.filter(booking => 
      ['CONFIRMADA', 'EN_PROGRESO'].includes(booking.status)
    ).length
    
    const completedBookings = bookingsData.filter(booking => 
      booking.status === 'COMPLETADA'
    ).length

    const pendingBookings = bookingsData.filter(booking => 
      booking.status === 'PENDIENTE'
    ).length

    setStats({ totalSpent, activeBookings, completedBookings, pendingBookings })
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // Filtro por estado
    if (activeFilter === 'pending') {
      filtered = filtered.filter(booking => booking.status === 'PENDIENTE')
    } else if (activeFilter === 'active') {
      filtered = filtered.filter(booking => ['CONFIRMADA', 'EN_PROGRESO'].includes(booking.status))
    } else if (activeFilter === 'completed') {
      filtered = filtered.filter(booking => ['COMPLETADA', 'CANCELADA'].includes(booking.status))
    }

    // Filtro por tipo
    if (typeFilter === 'items') {
      filtered = filtered.filter(booking => booking.item.type === 'item' || !booking.item.type)
    } else if (typeFilter === 'services') {
      filtered = filtered.filter(booking => booking.item.type === 'service')
    }

    // Búsqueda
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.borrower?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.owner?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredBookings(filtered)
  }

  const getDateStatus = (startDate: string, endDate: string, status: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    // Si está cancelada o vencida
    if (status === 'CANCELADA') {
      return { text: 'Cancelada', color: 'text-red-600', icon: <XCircle className="w-4 h-4" /> }
    }

    if (isPast(end) && status !== 'COMPLETADA') {
      return { text: 'Vencida', color: 'text-red-600', icon: <AlertTriangle className="w-4 h-4" /> }
    }

    if (status === 'COMPLETADA') {
      return { text: 'Completada', color: 'text-gray-600', icon: <CheckCircle className="w-4 h-4" /> }
    }

    // Si es hoy
    if (isToday(start)) {
      return { text: 'Hoy', color: 'text-green-600 font-semibold', icon: <Calendar className="w-4 h-4" /> }
    }

    // Si es en el futuro
    if (isFuture(start)) {
      const days = differenceInDays(start, now)
      
      if (days === 1) {
        return { text: 'Mañana', color: 'text-blue-600', icon: <Clock className="w-4 h-4" /> }
      } else if (days <= 5) {
        return { text: `En ${days} días`, color: 'text-blue-600', icon: <Clock className="w-4 h-4" /> }
      } else if (days <= 30) {
        const weeks = Math.ceil(days / 7)
        return { text: `En ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`, color: 'text-gray-600', icon: <Calendar className="w-4 h-4" /> }
      } else {
        return { text: format(start, 'dd/MM/yy'), color: 'text-gray-600', icon: <Calendar className="w-4 h-4" /> }
      }
    }

    // Si está en progreso
    return { text: 'En progreso', color: 'text-yellow-600', icon: <Timer className="w-4 h-4" /> }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "CONFIRMADA":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          text: "Confirmada",
          icon: <CheckCircle className="w-4 h-4" />,
        }
      case "PENDIENTE":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          text: "Pendiente",
          icon: <Clock className="w-4 h-4" />,
        }
      case "CANCELADA":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          text: "Cancelada",
          icon: <XCircle className="w-4 h-4" />,
        }
      case "COMPLETADA":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          text: "Completada",
          icon: <CheckCircle className="w-4 h-4" />,
        }
      case "EN_PROGRESO":
        return {
          color: "bg-purple-100 text-purple-800 border-purple-200",
          text: "En Progreso",
          icon: <Timer className="w-4 h-4" />,
        }
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          text: status,
          icon: null,
        }
    }
  }

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return `${format(startDate, "d MMM", { locale: es })} - ${format(endDate, "d MMM yyyy", { locale: es })}`
  }

  const openReviewModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowReviewModal(true)
  }

  const closeReviewModal = () => {
    setSelectedBooking(null)
    setShowReviewModal(false)
    fetchBookings()
  }

  const handleBookingAction = async (bookingId: string, action: 'confirm' | 'reject') => {
    try {
      const response = await fetch(`/api/booking/${bookingId}/${action}`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
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

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        {/* Header skeleton */}
        <div>
          <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 p-6 rounded-xl animate-pulse h-28"></div>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Bookings list skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-32 h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1">
                  <div className="flex justify-between mb-4">
                    <div>
                      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div>
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
        <p className="text-gray-600 mt-1">Gestiona todas tus reservas de herramientas y servicios</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Pendientes</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingBookings}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Activas</p>
              <p className="text-3xl font-bold mt-1">{stats.activeBookings}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Completadas</p>
              <p className="text-3xl font-bold mt-1">{stats.completedBookings}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Total Gastado</p>
              <p className="text-2xl font-bold mt-1">${stats.totalSpent.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">$</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Filtros por estado */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Todas', count: bookings.length },
                { key: 'pending', label: 'Pendientes', count: stats.pendingBookings },
                { key: 'active', label: 'Activas', count: stats.activeBookings },
                { key: 'completed', label: 'Finalizadas', count: stats.completedBookings }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === filter.key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>

          {/* Filtros por tipo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                typeFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('items')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                typeFilter === 'items'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Herramientas
            </button>
            <button
              onClick={() => setTypeFilter('services')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                typeFilter === 'services'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Servicios
            </button>
          </div>

          {/* Búsqueda */}
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar reservas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Lista de reservas */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay reservas</h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'No se encontraron resultados para tu búsqueda'
                : activeFilter === 'all' 
                ? 'Aún no tienes reservas registradas.'
                : `No tienes reservas ${activeFilter === 'pending' ? 'pendientes' : activeFilter === 'active' ? 'activas' : 'finalizadas'}.`}
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const statusInfo = getStatusInfo(booking.status)
            const dateStatus = getDateStatus(booking.fechaInicio, booking.fechaFin, booking.status)
            const isOwner = booking.userRole === 'owner'
            const otherUser = isOwner ? booking.borrower : booking.owner
            const isPending = booking.status === 'PENDIENTE'
            
            return (
              <div 
                key={booking.id} 
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Imagen */}
                    <div className="flex-shrink-0">
                      <div className="relative w-full lg:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={booking.item.imagenes[0] || '/placeholder.jpg'}
                          alt={booking.item.nombre}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          {booking.item.type === 'service' ? (
                            <div className="bg-purple-600 text-white p-1.5 rounded-md">
                              <Briefcase className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="bg-blue-600 text-white p-1.5 rounded-md">
                              <Wrench className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        {/* Info del item */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold text-gray-900 truncate">
                                {booking.item.nombre}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatDateRange(booking.fechaInicio, booking.fechaFin)}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                                {statusInfo.icon}
                                {statusInfo.text}
                              </div>
                              <div className={`inline-flex items-center gap-1 text-sm font-medium ${dateStatus.color}`}>
                                {dateStatus.icon}
                                {dateStatus.text}
                              </div>
                            </div>
                          </div>

                          {/* Usuario */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {otherUser?.name.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {otherUser?.name || 'Usuario no disponible'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {isOwner ? 'Prestatario' : 'Prestador'}
                              </p>
                            </div>
                          </div>

                          {/* Timeline de progreso */}
                          {!['CANCELADA', 'COMPLETADA'].includes(booking.status) && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-600">Progreso</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {/* Pendiente */}
                                <div className="flex flex-col items-center gap-1 flex-1">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    booking.status === 'PENDIENTE' 
                                      ? 'bg-yellow-500 text-white ring-4 ring-yellow-100' 
                                      : 'bg-gray-300 text-white'
                                  }`}>
                                    <Clock className="w-4 h-4" />
                                  </div>
                                  <span className="text-xs text-gray-600 text-center">Pendiente</span>
                                </div>
                                
                                {/* Línea */}
                                <div className={`flex-1 h-1 rounded-full ${
                                  ['CONFIRMADA', 'EN_PROGRESO'].includes(booking.status) 
                                    ? 'bg-green-500' 
                                    : 'bg-gray-200'
                                }`}></div>

                                {/* Confirmada */}
                                <div className="flex flex-col items-center gap-1 flex-1">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    booking.status === 'CONFIRMADA' 
                                      ? 'bg-green-500 text-white ring-4 ring-green-100' 
                                      : ['EN_PROGRESO'].includes(booking.status)
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-300 text-white'
                                  }`}>
                                    <CheckCircle className="w-4 h-4" />
                                  </div>
                                  <span className="text-xs text-gray-600 text-center">Confirmada</span>
                                </div>

                                {/* Línea */}
                                <div className={`flex-1 h-1 rounded-full ${
                                  booking.status === 'EN_PROGRESO' 
                                    ? 'bg-purple-500' 
                                    : 'bg-gray-200'
                                }`}></div>

                                {/* En Progreso */}
                                <div className="flex flex-col items-center gap-1 flex-1">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    booking.status === 'EN_PROGRESO' 
                                      ? 'bg-purple-500 text-white ring-4 ring-purple-100' 
                                      : 'bg-gray-300 text-white'
                                  }`}>
                                    <Timer className="w-4 h-4" />
                                  </div>
                                  <span className="text-xs text-gray-600 text-center">En Curso</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Precio y acciones */}
                        <div className="flex flex-col items-end gap-3 lg:ml-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              ${booking.total.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              ${booking.item.precioPorDia}/{booking.item.type === 'service' ? 'hora' : 'día'}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 justify-end">
                            <Link 
                              href={`/dashboard/bookings/${booking.id}`}
                              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Link>

                            {isOwner && isPending && (
                              <>
                                <button
                                  onClick={() => handleBookingAction(booking.id, 'confirm')}
                                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Aceptar
                                </button>
                                <button
                                  onClick={() => handleBookingAction(booking.id, 'reject')}
                                  className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Rechazar
                                </button>
                              </>
                            )}

                            {booking.canReview && !booking.hasReviewed && (
                              <button
                                onClick={() => openReviewModal(booking)}
                                className="inline-flex items-center px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                              >
                                <Star className="w-4 h-4 mr-1" />
                                Calificar
                              </button>
                            )}

                            {otherUser && (
                              <Link 
                                href={`/messages/${otherUser.id}`}
                                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Mensaje
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
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
    </div>
  )
}
