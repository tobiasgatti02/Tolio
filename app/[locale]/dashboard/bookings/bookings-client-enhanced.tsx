"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { 
  Calendar, Clock, CheckCircle, XCircle, AlertTriangle,
  Filter, Search, Star, Eye, MessageCircle, Package,
  Wrench, Briefcase, ChevronRight
} from "lucide-react"
import { format, differenceInDays, differenceInWeeks, isPast, isFuture, isToday, addDays } from "date-fns"
import { es } from "date-fns/locale"
import ReviewModal from "./review-modal"
import { DashboardBooking, BookingStatus } from '@/lib/types'

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
  status: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA'
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
  cancelledBookings: number
}

// ============== CONSTANTES FUERA DEL COMPONENTE ==============
const STATUS_MAP: Record<string, { color: string; text: string; iconType: 'check' | 'clock' | 'x' }> = {
  CONFIRMADA: { color: "bg-green-100 text-green-800 border-green-200", text: "Confirmada", iconType: 'check' },
  PENDIENTE: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", text: "Pendiente", iconType: 'clock' },
  CANCELADA: { color: "bg-red-100 text-red-800 border-red-200", text: "Cancelada", iconType: 'x' },
  COMPLETADA: { color: "bg-blue-100 text-blue-800 border-blue-200", text: "Completada", iconType: 'check' },
}

const FILTER_OPTIONS = [
  { key: 'all' as const, label: 'Todas' },
  { key: 'pending' as const, label: 'Pendientes' },
  { key: 'active' as const, label: 'Activas' },
  { key: 'completed' as const, label: 'Finalizadas' },
] as const

// Función pura para calcular stats (single pass)
function calculateStatsFromBookings(bookingsData: Booking[]): BookingsStats {
  let totalSpent = 0, activeBookings = 0, completedBookings = 0, pendingBookings = 0, cancelledBookings = 0
  
  for (const booking of bookingsData) {
    switch (booking.status) {
      case 'CONFIRMADA': activeBookings++; break
      case 'COMPLETADA': 
        completedBookings++
        if (booking.userRole === 'borrower') totalSpent += booking.total
        break
      case 'PENDIENTE': pendingBookings++; break
      case 'CANCELADA': cancelledBookings++; break
    }
  }
  
  return { totalSpent, activeBookings, completedBookings, pendingBookings, cancelledBookings }
}

export default function BookingsClientEnhanced({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'items' | 'services'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<DashboardBooking | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean
    bookingId: string
    action: 'confirm' | 'reject' | 'complete'
    title: string
    message: string
  } | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch bookings una sola vez al montar
  useEffect(() => {
    let isMounted = true
    
    async function fetchBookings() {
      try {
        const response = await fetch('/api/dashboard/bookings')
        if (response.ok && isMounted) {
          const data = await response.json()
          setBookings(data)
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    
    fetchBookings()
    return () => { isMounted = false }
  }, [])

  // Stats calculados con useMemo - single pass, se recalcula solo cuando bookings cambia
  const stats = useMemo(() => calculateStatsFromBookings(bookings), [bookings])

  // Filtrado con useMemo - evita recálculo innecesario
  const filteredBookings = useMemo(() => {
    let filtered = bookings

    // Filtro por estado
    if (activeFilter === 'pending') {
      filtered = filtered.filter(b => b.status === 'PENDIENTE')
    } else if (activeFilter === 'active') {
      filtered = filtered.filter(b => b.status === 'CONFIRMADA')
    } else if (activeFilter === 'completed') {
      filtered = filtered.filter(b => b.status === 'COMPLETADA' || b.status === 'CANCELADA')
    }

    // Filtro por tipo
    if (typeFilter === 'items') {
      filtered = filtered.filter(b => b.item.type === 'item' || !b.item.type)
    } else if (typeFilter === 'services') {
      filtered = filtered.filter(b => b.item.type === 'service')
    }

    // Búsqueda (solo si hay término)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(b =>
        b.item.nombre.toLowerCase().includes(term) ||
        b.borrower?.name.toLowerCase().includes(term) ||
        b.owner?.name.toLowerCase().includes(term)
      )
    }

    return filtered
  }, [bookings, activeFilter, typeFilter, searchTerm])

  // Filter counts memoizados
  const filterCounts = useMemo(() => ({
    all: bookings.length,
    pending: stats.pendingBookings,
    active: stats.activeBookings,
    completed: stats.completedBookings + stats.cancelledBookings,
  }), [bookings.length, stats])

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
    return { text: 'En progreso', color: 'text-yellow-600', icon: <Clock className="w-4 h-4" /> }
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

  // Callbacks estables con useCallback
  const openReviewModal = useCallback((booking: Booking) => {
    const mappedBooking: DashboardBooking = {
      ...booking,
      status: (booking.status === 'PENDIENTE' ? 'PENDING' :
               booking.status === 'CONFIRMADA' ? 'CONFIRMED' :
               booking.status === 'COMPLETADA' ? 'COMPLETED' : 'CANCELLED') as BookingStatus
    }
    setSelectedBooking(mappedBooking)
    setShowReviewModal(true)
  }, [])

  const closeReviewModal = useCallback(() => {
    setSelectedBooking(null)
    setShowReviewModal(false)
    // Refetch bookings después de cerrar el modal de review
    fetch('/api/dashboard/bookings')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setBookings)
      .catch(console.error)
  }, [])

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const openConfirmModal = useCallback((bookingId: string, action: 'confirm' | 'reject' | 'complete') => {
    const titles = { confirm: '¿Confirmar reserva?', reject: '¿Cancelar reserva?', complete: '¿Completar reserva?' }
    const messages = {
      confirm: 'Al confirmar, te comprometes a cumplir con esta reserva.',
      reject: 'Esta acción cancelará la reserva y notificará al usuario.',
      complete: 'Al completar, la reserva se marcará como finalizada y podrás recibir una reseña.'
    }
    setConfirmModal({ show: true, bookingId, action, title: titles[action], message: messages[action] })
  }, [])

  const handleBookingAction = useCallback(async () => {
    if (!confirmModal) return
    
    const { bookingId, action } = confirmModal
    setActionLoading(bookingId)
    setConfirmModal(null)
    
    try {
      const response = await fetch(`/api/booking/${bookingId}/${action}`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        const responseData = await response.json()
        
        // Actualizar solo el booking afectado en el estado local
        const statusMap: Record<string, string> = {
          confirm: 'CONFIRMADA',
          reject: 'CANCELADA',
          complete: 'COMPLETADA'
        }
        
        setBookings(prev => prev.map(b => 
          b.id === bookingId 
            ? { ...b, status: statusMap[action] as Booking['status'], canReview: action === 'complete' }
            : b
        ))
        
        // Si se confirmó y puede incluir materiales, mostrar mensaje especial
        if (action === 'confirm' && responseData.mayIncludeMaterials) {
          showToast('success', '¡Reserva confirmada! Si necesitas materiales, puedes solicitarlos desde el chat con el cliente.')
        } else {
          const actionMessages = {
            confirm: 'Reserva confirmada',
            reject: 'Reserva cancelada', 
            complete: 'Reserva completada'
          }
          showToast('success', actionMessages[action])
        }
      } else {
        const errorData = await response.json()
        showToast('error', errorData.error || 'No se pudo procesar la reserva')
      }
    } catch (error) {
      console.error('Error processing booking:', error)
      showToast('error', 'Error al procesar la reserva')
    } finally {
      setActionLoading(null)
    }
  }, [confirmModal, showToast])

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {/* Header */}
        <div>
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-1"></div>
          <div className="h-4 w-72 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Stats - más compactos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-xl h-20 animate-pulse"></div>
          ))}
        </div>

        {/* Filtros simplificados */}
        <div className="bg-white p-3 rounded-xl border border-gray-200 flex gap-2 flex-wrap">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse ml-auto"></div>
        </div>

        {/* Solo 2 bookings en skeleton */}
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex gap-2 mt-2">
                  <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
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
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-medium">{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

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
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Filtros por estado */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeFilter === filter.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filterCounts[filter.key]})
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

          {/* Filtros por tipo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                typeFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('items')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                typeFilter === 'items'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">Herramientas</span>
            </button>
            <button
              onClick={() => setTypeFilter('services')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                typeFilter === 'services'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Servicios</span>
            </button>
          </div>

          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px] ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar reservas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
            const isConfirmed = booking.status === 'CONFIRMADA'
            
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
                              <div className="flex items-center gap-2">
                                {/* Pendiente */}
                                <div className="flex flex-col items-center gap-1">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                    booking.status === 'PENDIENTE' 
                                      ? 'bg-yellow-500 text-white ring-2 ring-yellow-200' 
                                      : 'bg-green-500 text-white'
                                  }`}>
                                    <Clock className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-[10px] text-gray-600">Pendiente</span>
                                </div>
                                
                                {/* Línea 1 */}
                                <div className={`flex-1 h-0.5 rounded-full ${
                                  ['CONFIRMADA'].includes(booking.status) 
                                    ? 'bg-green-500' 
                                    : 'bg-gray-200'
                                }`}></div>

                                {/* Confirmada */}
                                <div className="flex flex-col items-center gap-1">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                    booking.status === 'CONFIRMADA' 
                                      ? 'bg-blue-500 text-white ring-2 ring-blue-200' 
                                      : booking.status === 'COMPLETADA'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-400'
                                  }`}>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-[10px] text-gray-600">Confirmada</span>
                                </div>
                                
                                {/* Línea 2 */}
                                <div className={`flex-1 h-0.5 rounded-full ${
                                  booking.status === 'COMPLETADA' 
                                    ? 'bg-green-500' 
                                    : 'bg-gray-200'
                                }`}></div>

                                {/* Completada */}
                                <div className="flex flex-col items-center gap-1">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                    booking.status === 'COMPLETADA' 
                                      ? 'bg-green-500 text-white ring-2 ring-green-200' 
                                      : 'bg-gray-200 text-gray-400'
                                  }`}>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-[10px] text-gray-600">Completada</span>
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
                                  onClick={() => openConfirmModal(booking.id, 'confirm')}
                                  disabled={actionLoading === booking.id}
                                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Aceptar
                                </button>
                                <button
                                  onClick={() => openConfirmModal(booking.id, 'reject')}
                                  disabled={actionLoading === booking.id}
                                  className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Rechazar
                                </button>
                              </>
                            )}

                            {!isOwner && isPending && (
                              <button
                                onClick={() => openConfirmModal(booking.id, 'reject')}
                                disabled={actionLoading === booking.id}
                                className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancelar
                              </button>
                            )}

                            {isOwner && isConfirmed && (
                              <>
                                <button
                                  onClick={() => openConfirmModal(booking.id, 'complete')}
                                  disabled={actionLoading === booking.id}
                                  className="inline-flex items-center px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Completar
                                </button>
                                <button
                                  onClick={() => openConfirmModal(booking.id, 'reject')}
                                  disabled={actionLoading === booking.id}
                                  className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Cancelar
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

      {/* Modal de confirmación */}
      {confirmModal?.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                confirmModal.action === 'reject' 
                  ? 'bg-red-100' 
                  : confirmModal.action === 'complete'
                    ? 'bg-green-100'
                    : 'bg-blue-100'
              }`}>
                {confirmModal.action === 'reject' ? (
                  <XCircle className={`w-8 h-8 text-red-600`} />
                ) : (
                  <CheckCircle className={`w-8 h-8 ${confirmModal.action === 'complete' ? 'text-green-600' : 'text-blue-600'}`} />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
              <p className="text-gray-600 mb-6">{confirmModal.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBookingAction}
                  className={`flex-1 px-4 py-3 text-white font-medium rounded-xl transition-colors ${
                    confirmModal.action === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : confirmModal.action === 'complete'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {confirmModal.action === 'confirm' ? 'Confirmar' : confirmModal.action === 'complete' ? 'Completar' : 'Cancelar reserva'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
