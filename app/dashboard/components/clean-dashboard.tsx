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

interface DashboardStats {
  totalItems: number
  activeBookings: number
  pendingBookings: number
  completedBookings: number
  totalEarnings: number
  trustScore: number
  notifications: number
  todayEarnings: number
  monthlyEarnings: number
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

interface DashboardItem {
  id: string
  title: string
  images: string[]
  price: number
  isAvailable: boolean
  bookings: number
  earnings: number
  category: string
  createdAt: Date
}

interface BookingItem {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  item: {
    id: string
    title: string
    images: string[]
    price: number
  }
  borrower: {
    id: string
    firstName: string
    profileImage?: string
    }
  startDate: Date
  endDate: Date
  totalAmount: number
  paymentStatus: 'PENDING' | 'PAID' | 'COMPLETED' | 'REFUNDED' | 'FAILED'
  createdAt: Date
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
  const [bookings, setBookings] = useState<BookingItem[]>([])
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
        
        // Usar URLs relativas en su lugar
        const [statsRes, itemsRes, bookingsRes, notificationsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/items'),
          fetch('/api/dashboard/bookings'),
          fetch('/api/dashboard/notifications')
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        } else {
          console.error('Error fetching stats:', statsRes.status, statsRes.statusText)
        }

        if (itemsRes.ok) {
          const itemsData = await itemsRes.json()
          setItems(itemsData)
        } else {
          console.error('Error fetching items:', itemsRes.status, itemsRes.statusText)
        }

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json()
          setBookings(bookingsData)
        } else {
          console.error('Error fetching bookings:', bookingsRes.status, bookingsRes.statusText)
        }

        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json()
          setNotifications(notificationsData)
        } else {
          console.error('Error fetching notifications:', notificationsRes.status, notificationsRes.statusText)
        }

      } catch (error) {
        console.error('Error cargando datos del dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const menuItems = [
    { 
      id: 'overview', 
      label: 'Resumen', 
      icon: Home, 
      path: '/dashboard',
      count: stats.notifications > 0 ? stats.notifications : undefined
    },
    { 
      id: 'items', 
      label: 'Mis Artículos', 
      icon: Package, 
      path: '/dashboard/my-items',
      count: stats.totalItems,
      subItems: [
        { label: 'Publicar artículo', path: '/items/nuevo', icon: Plus },
      ]
    },
    { 
      id: 'bookings', 
      label: 'Reservas', 
      icon: Calendar, 
      path: '/dashboard/bookings',
      count: stats.activeBookings + stats.pendingBookings,
      subItems: [
        { label: 'Reservas activas', path: '/dashboard/bookings?status=active', icon: Clock },
        { label: 'Historial', path: '/dashboard/bookings?status=completed', icon: CheckCircle }
      ]
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
      subItems: [
        { label: 'Perfil', path: '/dashboard/settings?tab=profile', icon: User },
        { label: 'Pagos', path: '/dashboard/settings?tab=payments', icon: CreditCard },
        { label: 'Notificaciones', path: '/dashboard/settings?tab=notifications', icon: Bell }
      ]
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
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Artículos publicados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
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
                  <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.trustScore.toFixed(1)}/5.0</p>
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
                      <p className="text-sm font-medium text-gray-900 truncate">{booking.item.title}</p>
                      <p className="text-sm text-gray-500">Reservado por {booking?.borrower.firstName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status === 'CONFIRMED' ? 'Confirmado' :
                       booking.status === 'PENDING' ? 'Pendiente' : booking.status}
                    </span>
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
                  <p className="text-lg font-bold text-gray-900">{stats.trustScore.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Confianza</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-gray-900">{stats.totalItems}</p>
                  <p className="text-xs text-gray-500">Artículos</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 mx-auto">
                  <p className="text-lg font-bold text-gray-900">${stats.totalEarnings.toLocaleString()}</p>
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
                    {item.subItems.map((subItem, index) => (
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
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
