"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { 
  Home, Package, Calendar, Star, Settings, Bell, 
  Plus, TrendingUp, Users, MessageCircle, Heart,
  DollarSign, Clock, CheckCircle, AlertCircle,
  Eye, Edit, Trash2, Search, Filter, MoreVertical,
  User, CreditCard, MapPin, Phone, Mail, Shield,
  ArrowUpRight, ArrowDownRight, Menu, X
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
  startDate: Date
  endDate: Date
  totalPrice: number
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED'
  paymentMethod: 'MERCADOPAGO' | 'TRANSFER'
  item: {
    id: string
    title: string
    images: string[]
    owner: {
      firstName: string
      lastName: string
    }
  }
  borrower?: {
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string
  }
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = "emerald",
  trend = "up"
}: {
  title: string
  value: string | number
  change?: string
  icon: any
  color?: "emerald" | "blue" | "purple" | "orange" | "red"
  trend?: "up" | "down" | "neutral"
}) => {
  const colorClasses = {
    emerald: "bg-emerald-500 text-emerald-50",
    blue: "bg-blue-500 text-blue-50", 
    purple: "bg-purple-500 text-purple-50",
    orange: "bg-orange-500 text-orange-50",
    red: "bg-red-500 text-red-50"
  }

  const trendClasses = {
    up: "text-emerald-600 bg-emerald-50",
    down: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-50"
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <div className={`flex items-center space-x-1 text-sm font-medium px-2 py-1 rounded-full ${trendClasses[trend]}`}>
            {trend === "up" && <ArrowUpRight className="w-4 h-4" />}
            {trend === "down" && <ArrowDownRight className="w-4 h-4" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
      </div>
    </div>
  )
}

export default function UnifiedDashboard({ 
  user, 
  children 
}: {
  user: any
  children?: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
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

  // Manejar cambios en parámetros de URL
  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview'
    setActiveTab(tab)
    
    const success = searchParams.get('success') === 'true'
    setShowSuccess(success)
    
    if (success) {
      // Limpiar el parámetro success después de 3 segundos
      setTimeout(() => {
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.delete('success')
        router.replace(`${pathname}?${newParams.toString()}`)
        setShowSuccess(false)
      }, 3000)
    }
  }, [searchParams, pathname, router])

  // Determinar la pestaña activa basada en la URL
  useEffect(() => {
    if (pathname.includes('/my-items')) setActiveTab('items')
    else if (pathname.includes('/bookings')) setActiveTab('bookings')
    else if (pathname.includes('/reviews')) setActiveTab('reviews')
    else if (pathname.includes('/settings')) setActiveTab('settings')
    else setActiveTab('overview')
  }, [pathname])

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        const [statsRes, itemsRes, bookingsRes, notificationsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/items'),
          fetch('/api/dashboard/bookings'),
          fetch('/api/dashboard/notifications')
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (itemsRes.ok) {
          const itemsData = await itemsRes.json()
          setItems(itemsData)
        }

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json()
          setBookings(bookingsData)
        }

        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json()
          setNotifications(notificationsData)
        }

      } catch (error) {
        console.error('Error cargando datos del dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const sidebarItems = [
    { id: 'overview', label: 'Resumen', icon: Home, path: '/dashboard' },
    { id: 'items', label: 'Mis Publicaciones', icon: Package, path: '/dashboard/my-items' },
    { id: 'bookings', label: 'Reservas', icon: Calendar, path: '/dashboard/bookings' },
    { id: 'sales', label: 'Ventas', icon: TrendingUp, path: '/dashboard/sales' },
    { id: 'expenses', label: 'Gastos', icon: CreditCard, path: '/dashboard/expenses' },
    { id: 'calendar', label: 'Calendario', icon: Clock, path: '/dashboard/calendar' },
    { id: 'reviews', label: 'Reseñas', icon: Star, path: '/dashboard/reviews' },
    { id: 'settings', label: 'Configuración', icon: Settings, path: '/dashboard/settings' },
  ]

  const handleTabChange = (tabId: string, path: string) => {
    setActiveTab(tabId)
    router.push(path)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold">Tolio</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tolio</h1>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name || 'Usuario'}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            {!loading && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">{stats.trustScore}/5.0</p>
                  <p className="text-xs text-gray-500">Confianza</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">{stats.totalItems}</p>
                  <p className="text-xs text-gray-500">Artículos</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">${stats.totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Ganado</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleTabChange(item.id, item.path)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                      ${activeTab === item.id
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.id === 'overview' && stats.notifications > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {stats.notifications}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Acciones Rápidas</h3>
              <div className="space-y-2">
                <Link
                  href="/items/nuevo"
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Nuevo Artículo</span>
                </Link>
              </div>
            </div>
          </nav>
        </div>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Success Alert */}
          {showSuccess && (
            <div className="p-4">
              <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p>¡Operación completada con éxito!</p>
              </div>
            </div>
          )}

          {/* Page Content */}
          {activeTab === 'overview' ? (
            <div className="p-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Hola, {user?.name?.split(' ')[0] || 'Usuario'}! 👋
                </h1>
                <p className="text-gray-600">
                  Aquí tienes un resumen de tu actividad en Tolio
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Artículos Activos"
                    value={stats.totalItems}
                    change="+2 este mes"
                    icon={Package}
                    color="emerald"
                    trend="up"
                  />
                  <StatCard
                    title="Reservas Activas"
                    value={stats.activeBookings}
                    change={`${stats.pendingBookings} pendientes`}
                    icon={Calendar}
                    color="blue"
                    trend="neutral"
                  />
                  <StatCard
                    title="Ganado Este Mes"
                    value={`$${stats.monthlyEarnings.toLocaleString()}`}
                    change="+15%"
                    icon={DollarSign}
                    color="purple"
                    trend="up"
                  />
                  <StatCard
                    title="Puntuación"
                    value={`${stats.trustScore}/5.0`}
                    change="Excelente"
                    icon={Star}
                    color="orange"
                    trend="up"
                  />
                </div>
              )}

              {/* Recent Activity y Quick Stats */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Items */}
                <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Mis Publicaciones Recientes</h2>
                    <Link 
                      href="/dashboard/my-items"
                      className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                    >
                      Ver todos
                    </Link>
                  </div>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center space-x-4 animate-pulse">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="w-40 h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="w-24 h-3 bg-gray-200 rounded"></div>
                          </div>
                          <div className="w-16 h-4 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : items.length > 0 ? (
                    <div className="space-y-4">
                      {items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            {item.images[0] ? (
                              <Image
                                src={item.images[0]}
                                alt={item.title}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-500">${item.price}/día • {item.bookings} reservas</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">${item.earnings}</p>
                            <p className="text-sm text-gray-500">ganado</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No tienes artículos publicados aún</p>
                      <Link
                        href="/items/nuevo"
                        className="inline-flex items-center space-x-2 mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Publicar Primer Artículo</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Notificaciones</h2>
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </div>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                          <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-gray-400' : 'bg-blue-500'}`} />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No tienes notificaciones</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  )
}
