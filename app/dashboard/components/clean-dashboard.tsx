"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  Home, Package, Calendar, Star, Settings, Bell, 
  Plus, TrendingUp, Users, MessageCircle, 
  DollarSign, Clock, CheckCircle, AlertCircle,
  Eye, Edit, Trash2, Search, Filter, MoreVertical,
  User, CreditCard, MapPin, Phone, Mail, Shield,
  Wallet, ArrowUpRight, ArrowDownRight, Menu, X,
  ChevronDown, ChevronRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { STATUS_COLORS, BOOKING_STATUS, ERROR_MESSAGES } from "@/lib/dashboard-constants"
import { DashboardBooking, DashboardStats, DashboardItem, DashboardReview, DashboardNotification } from "@/lib/types"

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

export default function CleanDashboard({ 
  user, 
  children 
}: {
  user: any
  children?: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  
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

  // Determinar la sección activa basada en la URL
  const getActiveSection = () => {
    if (pathname === '/dashboard') return 'overview'
    if (pathname.includes('/my-items')) return 'items'
    if (pathname.includes('/booking')) return 'bookings'
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
      label: 'Resumen', 
      icon: Home, 
      path: '/dashboard',
      count: (stats.notifications || 0) > 0 ? stats.notifications : undefined
    },
    { 
      id: 'items', 
      label: 'Mis Artículos', 
      icon: Package, 
      path: '/dashboard/my-items',
      count: stats.totalItems || 0,
    },
    { 
      id: 'bookings', 
      label: 'Reservas', 
      icon: Calendar, 
      path: '/dashboard/bookings',
      count: (stats.activeBookings || 0) + (stats.pendingBookings || 0),
    },
    { 
      id: 'reviews', 
      label: 'Reseñas', 
      icon: Star, 
      path: '/dashboard/reviews'
    },
    { 
      id: 'settings', 
      label: 'Configuración', 
      icon: Settings, 
      path: '/dashboard/settings',
    },
  ]

  const toggleDropdown = (itemId: string) => {
    setDropdowns(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const renderContent = () => {
    if (pathname === '/dashboard') {
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
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Artículos publicados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalItems || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reservas activas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeBookings || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ganancias totales</p>
                  <p className="text-2xl font-bold text-gray-900">${(stats.totalEarnings || 0).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Puntuación</p>
                  <p className="text-2xl font-bold text-gray-900">{(stats.trustScore || 0).toFixed(1)}/5.0</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad reciente</h3>
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
                      booking.status === 'CONFIRMADA' ? 'bg-green-100 text-green-800' :
                      booking.status === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status === 'CONFIRMADA' ? 'Confirmado' :
                       booking.status === 'PENDIENTE' ? 'Pendiente' : booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h3>
              <div className="space-y-3">
                <Link
                  href="/items/nuevo"
                  className="flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Publicar nuevo artículo</span>
                </Link>
                <Link
                  href="/dashboard/bookings"
                  className="flex items-center space-x-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
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
    }

    return children
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <h1 className="text-lg font-semibold text-gray-900">Panel de usuario</h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-96 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0 lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* User info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 truncate">{user?.name || 'Usuario'}</p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            {!loading && (
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-gray-900">{(stats.trustScore || 0).toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Confianza</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-gray-900">{stats.totalItems || 0}</p>
                  <p className="text-xs text-gray-500">Artículos</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 mx-auto">
                  <p className="text-lg font-bold text-gray-900">${(stats.totalEarnings || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Ganado</p>
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
            {menuItems.map((item) => (
              <div key={item.id}>
                <div className="flex items-center">
                  <Link
                    href={item.path}
                    className={`flex-1 flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
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
          </nav>

          {/* Quick actions */}
          <div className="p-4 border-t">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Acciones Rápidas
            </h4>
            <Link
              href="/items/nuevo"
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Nuevo Artículo</span>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          <main className="p-6">
            {loading ? (
              <div className="space-y-6">
                {/* Loading skeleton for stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                      <div className="animate-pulse">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                          </div>
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Loading skeleton for charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="space-y-3">
                          {[...Array(3)].map((_, j) => (
                            <div key={j} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                              <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              renderContent()
            )}
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
