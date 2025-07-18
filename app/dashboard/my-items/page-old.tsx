import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
  Package, Calendar, Star, Settings, 
  CheckCircle, XCircle, Clock, Plus, 
  ChevronRight, Edit, Trash, Eye, MoreVertical
} from "lucide-react"
import { Suspense } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export const metadata = {
  title: "Mis Artículos | Tolio",
  description: "Gestiona tus artículos y prestamos",
}

// Helper function to format dates
const formatDate = (date: Date) => {
  return format(date, "d 'de' MMMM, yyyy", { locale: es })
}

// Helper function to get status information
const getStatusInfo = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return {
        color: "bg-green-100 text-green-800",
        text: "Confirmado",
        icon: <CheckCircle className="h-4 w-4 mr-1" />,
      }
    case "PENDING":
      return {
        color: "bg-yellow-100 text-yellow-800",
        text: "Pendiente",
        icon: <Clock className="h-4 w-4 mr-1" />,
      }
    case "CANCELLED":
      return {
        color: "bg-red-100 text-red-800",
        text: "Cancelado",
        icon: <XCircle className="h-4 w-4 mr-1" />,
      }
    default:
      return {
        color: "bg-gray-100 text-gray-800",
        text: status,
        icon: null,
      }
  }
}

// Función para obtener artículos del usuario directamente desde la BD
async function getUserItems(userId: string) {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const items = await prisma.item.findMany({
      where: { ownerId: userId },
      include: {
        category: {
          select: {
            name: true
          }
        },
        bookings: {
          select: {
            status: true,
            totalPrice: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Formatear los datos como la API
    const formattedItems = items.map(item => ({
      id: item.id,
      title: item.title,
      images: item.images,
      price: item.price,
      isAvailable: item.isAvailable,
      bookings: item.bookings.length,
      earnings: item.bookings
        .filter(booking => booking.status === 'COMPLETED')
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0),
      category: item.category?.name || 'Sin categoría',
      createdAt: item.createdAt
    }))
    
    await prisma.$disconnect()
    return formattedItems
  } catch (error) {
    console.error('Error fetching user items:', error)
    return []
  }
}

export default async function MyItemsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/my-items")
  }
  
  const userId = session.user.id
  const myItems = await getUserItems(userId)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis artículos publicados</h1>
          <p className="text-gray-600">Gestiona tus artículos y sus reservas</p>
        </div>
        <Link
          href="/items/nuevo"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Publicar artículo</span>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total publicados</p>
              <p className="text-2xl font-bold text-gray-900">{myItems.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">
                {myItems.filter((item: any) => item.isAvailable).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total ganancias</p>
              <p className="text-2xl font-bold text-gray-900">
                ${myItems.reduce((sum: number, item: any) => sum + (item.earnings || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Todos los artículos</h2>
        </div>
        
        {myItems.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes artículos publicados</h3>
            <p className="text-gray-600 mb-6">Comienza publicando tu primer artículo para ganar dinero</p>
            <Link
              href="/items/nuevo"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar primer artículo</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {myItems.map((item: any) => (
              <div key={item.id} className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Item image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.images && item.images.length > 0 ? (
                      <Image
                        src={item.images[0]}
                        alt={item.title}
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

                  {/* Item details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">Categoría: {item.category}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>${item.price.toLocaleString()}/día</span>
                          <span>{item.bookings || 0} reservas</span>
                          <span>${(item.earnings || 0).toLocaleString()} ganado</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          item.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.isAvailable ? 'Disponible' : 'No disponible'}
                        </span>
                        
                        <div className="relative">
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-3 mt-4">
                      <Link
                        href={`/items/${item.id}`}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver artículo</span>
                      </Link>
                      
                      <Link
                        href={`/items/${item.id}/edit`}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </Link>
                    </div>

                    {/* Recent bookings */}
                    {item.recentBookings && item.recentBookings.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Reservas recientes:</h4>
                        <div className="space-y-2">
                          {item.recentBookings.slice(0, 2).map((booking: any) => (
                            <div key={booking.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600">{booking.renterName}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">
                                  {formatDate(new Date(booking.startDate))} - {formatDate(new Date(booking.endDate))}
                                </span>
                              </div>
                              <div className="flex items-center">
                                {getStatusInfo(booking.status).icon}
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusInfo(booking.status).color}`}>
                                  {getStatusInfo(booking.status).text}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
