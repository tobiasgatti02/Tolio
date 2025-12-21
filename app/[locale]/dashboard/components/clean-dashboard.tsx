"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations, useLocale } from 'next-intl'
import { 
  Home, Package, Calendar, Star, Settings, 
  Plus, 
  DollarSign, TrendingUp, CreditCard, Clock,
 Menu, X,
  ChevronDown, ChevronRight,
  HelpCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { STATUS_COLORS, BOOKING_STATUS, ERROR_MESSAGES } from "@/lib/dashboard-constants"
import { DashboardBooking, DashboardStats, DashboardItem, DashboardReview, DashboardNotification } from "@/lib/types"
import StripeAccountCheck from "@/components/stripe-account-check"
import { useOnboarding } from "@/components/onboarding"
import BookingPreviewCard from "@/components/booking-preview-card"
import { useUserMode } from "@/contexts/user-mode-context"

interface MenuItem {
  id: string
  label: string
  icon: any
  path: string
  count?: number
  subItems?: MenuItem[]
}

interface NotificationItem {
  id: string
  type: 'booking' | 'payment' | 'review' | 'message'
  title: string
  message: string
  createdAt: Date
  read: boolean
  actionUrl?: string
}

// Helper para traducciones seguras - convierte cualquier resultado a string
function useSafeTranslations(namespace: string) {
  const t = useTranslations(namespace)
  return (key: string, params?: Record<string, string | number>) => {
    try {
      const result = t(key, params as any)
      // Si el resultado es un objeto (traducción no encontrada o namespace completo), devolver el key
      if (result === null || result === undefined) {
        return key
      }
      if (typeof result === 'object') {
        console.warn(`[i18n] Translation "${namespace}.${key}" returned an object instead of string`)
        return key
      }
      return String(result)
    } catch (err) {
      console.warn(`[i18n] Error getting translation "${namespace}.${key}":`, err)
      return key
    }
  }
}

export default function CleanDashboard({ 
  user, 
  children 
}: {
  user: any
  children?: React.ReactNode
}) {
  const t = useSafeTranslations('common.dashboard')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { showOnboarding, isOnboardingComplete } = useOnboarding()
  const { userMode } = useUserMode()
  
  const isBuyerContext = userMode === 'buyer'
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    activeBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    trustScore: 0,
    notifications: 0,
    todayEarnings: 0,
    monthlyEarnings: 0
  })
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [items, setItems] = useState<DashboardItem[]>([])
  const [bookings, setBookings] = useState<DashboardBooking[]>([])
  const [dropdowns, setDropdowns] = useState<{[key: string]: boolean}>({})

  // Trigger onboarding for new users
  useEffect(() => {
    if (!isOnboardingComplete) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        showOnboarding()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isOnboardingComplete, showOnboarding])

  // Redirect buyers to expenses if accessing other pages
  useEffect(() => {
    if (isBuyerContext && !['expenses', 'bookings', 'calendar', 'reviews', 'settings'].some(page => pathname.includes(`/dashboard/${page}`))) {
      router.push(`/${locale}/dashboard/expenses`)
    }
  }, [isBuyerContext, pathname, router, locale])

  // Determinar la sección activa basada en la URL
  const getActiveSection = () => {
    if (pathname.includes('/dashboard') && !pathname.includes('/my-items') && !pathname.includes('/booking') && !pathname.includes('/sales') && !pathname.includes('/expenses') && !pathname.includes('/calendar') && !pathname.includes('/reviews') && !pathname.includes('/settings')) return 'overview'
    if (pathname.includes('/my-items')) return 'items'
    if (pathname.includes('/booking')) return 'bookings'
    if (pathname.includes('/sales')) return 'sales'
    if (pathname.includes('/expenses')) return 'expenses'
    if (pathname.includes('/calendar')) return 'calendar'
    if (pathname.includes('/reviews')) return 'reviews'
    if (pathname.includes('/settings')) return 'settings'
    return 'overview'
  }

  const activeSection = getActiveSection()

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Solo ejecutar en el cliente
      if (typeof window === 'undefined') return
      
      try {
        setLoading(true)
        setError(null)
        
        // Usar URLs relativas en su lugar
        const [statsRes, itemsRes, bookingsRes, notificationsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/items'),
          fetch('/api/dashboard/bookings'),
          fetch('/api/dashboard/notifications')
        ])

        // Manejar respuestas de stats
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        } else if (statsRes.status === 401) {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.')
          return
        } else {
          console.error('Error fetching stats:', statsRes.status, statsRes.statusText)
        }

        // Manejar respuestas de items
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json()
          setItems(itemsData)
        } else if (itemsRes.status !== 401) {
          console.error('Error fetching items:', itemsRes.status, itemsRes.statusText)
        }

        // Manejar respuestas de bookings
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json()
          setBookings(bookingsData)
        } else if (bookingsRes.status !== 401) {
          console.error('Error fetching bookings:', bookingsRes.status, bookingsRes.statusText)
        }

        // Manejar respuestas de notifications
        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json()
          setNotifications(notificationsData)
        } else if (notificationsRes.status !== 401) {
          console.error('Error fetching notifications:', notificationsRes.status, notificationsRes.statusText)
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Error al cargar los datos del dashboard.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const menuItems: MenuItem[] = [
    { 
      id: 'overview', 
      label: t('menu.overview'), 
      icon: Home, 
      path: `/${locale}/dashboard`,
      count: (stats.notifications || 0) > 0 ? stats.notifications : undefined
    },
    { 
      id: 'items', 
      label: t('menu.items'), 
      icon: Package, 
      path: `/${locale}/dashboard/my-items`,
      count: stats.totalItems || 0,
    },
    { 
      id: 'bookings', 
      label: t('menu.bookings'), 
      icon: Calendar, 
      path: `/${locale}/dashboard/bookings`,
      count: (stats.activeBookings || 0) + (stats.pendingBookings || 0),
    },
    { 
      id: 'sales', 
      label: t('menu.sales'), 
      icon: TrendingUp, 
      path: `/${locale}/dashboard/sales`
    },
    { 
      id: 'expenses', 
      label: t('menu.expenses'), 
      icon: CreditCard, 
      path: `/${locale}/dashboard/expenses`
    },
    { 
      id: 'calendar', 
      label: t('menu.calendar'), 
      icon: Clock, 
      path: `/${locale}/dashboard/calendar`
    },
    { 
      id: 'reviews', 
      label: t('menu.reviews'), 
      icon: Star, 
      path: `/${locale}/dashboard/reviews`
    },
    { 
      id: 'settings', 
      label: t('menu.settings'), 
      icon: Settings, 
      path: `/${locale}/dashboard/settings`,
    },
  ]

  const visibleMenuItems = isBuyerContext
    ? menuItems.filter((item) => ['expenses', 'bookings', 'calendar', 'reviews', 'settings'].includes(item.id))
    : menuItems

  const toggleDropdown = (itemId: string) => {
    setDropdowns(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const renderContent = () => {
    // Si NO es el overview, renderizar children inmediatamente (cada página maneja su propio loading)
    if (!(pathname.includes('/dashboard') && !pathname.includes('/my-items') && !pathname.includes('/booking') && !pathname.includes('/sales') && !pathname.includes('/expenses') && !pathname.includes('/calendar') && !pathname.includes('/reviews') && !pathname.includes('/settings'))) {
      return children
    }

    // Solo el overview muestra skeleton mientras carga sus datos
    if (loading) {
      return (
        <div className="space-y-6">
          <StripeAccountCheck />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Package, color: 'bg-blue-100', iconColor: 'text-blue-600' },
              { icon: Calendar, color: 'bg-green-100', iconColor: 'text-green-600' },
              { icon: DollarSign, color: 'bg-emerald-100', iconColor: 'text-emerald-600' },
              { icon: Star, color: 'bg-yellow-100', iconColor: 'text-yellow-600' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center`}>
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h3>
              <div className="space-y-3">
                <Link href="/items/nuevo" className="flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Publicar nuevo artículo</span>
                </Link>
                <Link href="/dashboard/bookings" className="flex items-center space-x-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Revisar reservas</span>
                </Link>
                <Link href="/dashboard/settings" className="flex items-center space-x-3 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Configurar cuenta</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Overview con datos cargados
    return (
        <div className="space-y-6">
          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{t('error')}</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      {t('retry')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aviso de Stripe */}
          <StripeAccountCheck />

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#ffe6d5] border border-[#feccaa] p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#c2570c]">{t('publishedItems')}</p>
                  <p className="text-4xl font-bold text-[#7c3d12]">{stats.totalItems || 0}</p>
                </div>
                <div className="w-12 h-12 bg-[#feccaa] rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-[#c2570c]" />
                </div>
              </div>
            </div>

            <div className="bg-[#d1fae5] border border-[#a7f3d0] p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#047857]">{t('activeBookings')}</p>
                  <p className="text-4xl font-bold text-[#065f46]">{stats.activeBookings || 0}</p>
                </div>
                <div className="w-12 h-12 bg-[#a7f3d0] rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#047857]" />
                </div>
              </div>
            </div>

            <div className="bg-[#feccaa] border border-[#fdac74] p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#c2570c]">{t('totalEarnings')}</p>
                  <p className="text-4xl font-bold text-[#7c3d12]">${(stats.totalEarnings || 0).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-[#fdac74] rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#c2570c]" />
                </div>
              </div>
            </div>

            <div className="bg-[#fff4e9] border border-[#ffe6d5] p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#c2570c]">{t('score')}</p>
                  <p className="text-4xl font-bold text-[#7c3d12]">{(stats.trustScore || 0).toFixed(1)}/5.0</p>
                </div>
                <div className="w-12 h-12 bg-[#ffe6d5] rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-[#f97316]" />
                </div>
              </div>
            </div>
          </div>

          {/* Próximas Reservas - Show if there are active or pending bookings */}
          {(stats.activeBookings > 0 || stats.pendingBookings > 0) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">📅 Próximas Reservas</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Tienes {stats.activeBookings + stats.pendingBookings} reserva{stats.activeBookings + stats.pendingBookings !== 1 ? 's' : ''} activa{stats.activeBookings + stats.pendingBookings !== 1 ? 's' : ''}
                  </p>
                </div>
                <Link
                  href="/dashboard/bookings"
                  className="text-[#f97316] hover:text-[#ea670c] font-medium text-sm flex items-center gap-1 group"
                >
                  Ver todas
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {bookings
                  .filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED')
                  .slice(0, 3)
                  .map((booking) => {
                    // Map status to Spanish format expected by BookingPreviewCard
                    const mappedBooking = {
                      ...booking,
                      status: (booking.status === 'PENDING' ? 'PENDIENTE' :
                               booking.status === 'CONFIRMED' ? 'CONFIRMADA' :
                               booking.status === 'COMPLETED' ? 'COMPLETADA' : 'CANCELADA') as 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA'
                    }
                    return <BookingPreviewCard key={booking.id} booking={mappedBooking} />
                  })}
              </div>
            </div>
          )}

          {/* Actividad reciente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('recentActivity')}</h3>
              <div className="space-y-4">
                {bookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{booking.item.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {booking.borrower ? `Reservado por ${booking.borrower.name}` : 
                         booking.owner ? `Prestado a ${booking.owner.name}` : 
                         'Información de usuario no disponible'}
                      </p>
                    </div>
                                        <Badge className={`${
                      booking.status === 'CONFIRMED' ? 'bg-[#d1fae5] text-[#065f46] hover:bg-[#a7f3d0]' :
                      booking.status === 'PENDING' ? 'bg-[#fff4e9] text-[#7c3d12] hover:bg-[#feccaa]' :
                      booking.status === 'COMPLETED' ? 'bg-[#dbeafe] text-[#1e3a8a] hover:bg-[#bfdbfe]' :
                      booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status === 'CONFIRMED' ? 'Confirmado' :
                       booking.status === 'PENDING' ? 'Pendiente' :
                       booking.status === 'COMPLETED' ? 'Completado' :
                       booking.status === 'CANCELLED' ? 'Cancelado' :
                       booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h3>
              <div className="space-y-3">
                {!isBuyerContext && (
                  <Link
                    href="/items/nuevo"
                    className="flex items-center space-x-3 p-3 bg-[#fff4e9] text-[#f97316] rounded-lg hover:bg-[#ffe6d5] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Publicar nuevo artículo</span>
                  </Link>
                )}
                <Link
                  href="/dashboard/bookings"
                  className="flex items-center space-x-3 p-3 bg-[#d1fae5] text-[#047857] rounded-lg hover:bg-[#a7f3d0] transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Revisar reservas</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center space-x-3 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Configurar cuenta</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )
    // Este return ya no se necesita porque el overview está arriba
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header móvil */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            <h1 className="text-lg font-bold text-gray-900">Panel</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] sm:w-80 lg:w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0 lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* User info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#feccaa] flex-shrink-0">
                {user?.image ? (
                  <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#f97316] to-[#ea670c] flex items-center justify-center text-white font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 truncate">{user?.name || 'Usuario'}</p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            {!loading && (
              <div className={`mt-4 grid ${isBuyerContext ? 'grid-cols-2' : 'grid-cols-3'} gap-3 text-center`}>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-gray-900">{(stats.trustScore || 0).toFixed(1)}</p>
                  <p className="text-xs text-gray-500">{t('trust')}</p>
                </div>
                {!isBuyerContext && (
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-900">{stats.totalItems || 0}</p>
                    <p className="text-xs text-gray-500">{t('items')}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-2 mx-auto">
                  <p className="text-lg font-bold text-gray-900">${(stats.totalEarnings || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{t('earned')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Close button móvil */}
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu items */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {visibleMenuItems.map((item) => (
              <div key={item.id}>
                <div className="flex items-center">
                  <Link
                    id={`sidebar-link-${item.id}`}
                    href={item.path}
                    className={`flex-1 flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-[#fff4e9] text-[#f97316]'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="ml-auto bg-[#feccaa] text-[#7c3d12] text-xs font-medium px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </Link>
                  {item.subItems && (
                    <button
                      onClick={() => toggleDropdown(item.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {dropdowns[item.id] ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
                {item.subItems && dropdowns[item.id] && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.subItems.map((subItem: MenuItem, index: number) => (
                      <Link
                        key={index}
                        href={subItem.path}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <subItem.icon className="w-4 h-4" />
                        <span>{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Ver tutorial button */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSidebarOpen(false)
                  showOnboarding()
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[#f97316] hover:bg-[#fff4e9] transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">Ver tutorial</span>
              </button>
            </div>
          </nav>


        </aside>

        {/* Main content */}
        <div className="flex-1 lg:ml-0 min-w-0">
          <main className="p-3 sm:p-4 md:p-6">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
