import { getBookingById } from "@/app/api/booking/route"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format, differenceInDays, isAfter, isBefore } from "date-fns"
import { es } from "date-fns/locale"
import { 
  Calendar, Clock, CreditCard, CheckCircle, 
  XCircle, User, MessageCircle, ChevronLeft, 
  MapPin, Phone, Mail, Star, Shield, Info,
  Eye, Heart, Share2, Package
} from "lucide-react"
import { BookingStatus } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import BookingActions from "@/components/booking-actions"
import BookingTimeline from "@/components/booking-timeline"

export const dynamic = "force-dynamic"

// Helper function to format dates safely
const formatDate = (date: Date | string | undefined) => {
  if (!date) return "Fecha no disponible"
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, "d 'de' MMMM, yyyy", { locale: es })
}

// Helper function to get relative time
const getRelativeTime = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  
  if (isBefore(dateObj, now)) {
    const days = differenceInDays(now, dateObj)
    if (days === 0) return "Hoy"
    if (days === 1) return "Ayer"
    return `Hace ${days} días`
  } else {
    const days = differenceInDays(dateObj, now)
    if (days === 0) return "Hoy"
    if (days === 1) return "Mañana"
    return `En ${days} días`
  }
}

// Helper function to get status information
const getStatusInfo = (status: string, startDate: Date, endDate: Date) => {
  const now = new Date()
  const isActive = isAfter(now, startDate) && isBefore(now, endDate)
  
  switch (status) {
    case "CONFIRMED":
      return {
        color: isActive ? "bg-blue-50 text-blue-900 border-blue-200" : "bg-emerald-50 text-emerald-900 border-emerald-200",
        text: isActive ? "En curso" : "Confirmado",
        icon: <CheckCircle className="h-4 w-4 mr-1" />,
        description: isActive ? "El alquiler está actualmente en curso" : "Reserva confirmada y lista para comenzar"
      }
    case "PENDING":
      return {
        color: "bg-orange-50 text-orange-900 border-orange-200",
        text: "Pendiente",
        icon: <Clock className="h-4 w-4 mr-1" />,
        description: "Esperando confirmación del propietario"
      }
    case "COMPLETED":
      return {
        color: "bg-green-50 text-green-900 border-green-200",
        text: "Completado",
        icon: <CheckCircle className="h-4 w-4 mr-1" />,
        description: "Alquiler finalizado exitosamente"
      }
    case "CANCELLED":
      return {
        color: "bg-red-50 text-red-900 border-red-200",
        text: "Cancelado",
        icon: <XCircle className="h-4 w-4 mr-1" />,
        description: "La reserva ha sido cancelada"
      }
    default:
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        text: "Desconocido",
        icon: null,
        description: "Estado no reconocido"
      }
  }
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BookingDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    const { id } = await params
    redirect("/login?callbackUrl=/dashboard/bookings/" + id)
  }
  
  const { id } = await params
  
  // Debug logging
  console.log('BookingDetailsPage - Booking ID:', id)
  console.log('BookingDetailsPage - User ID:', session.user.id)
  
  const booking = await getBookingById(id) as any
  
  console.log('BookingDetailsPage - Booking found:', booking ? 'yes' : 'no')
  
  if (!booking) {
    console.log('BookingDetailsPage - Booking not found, showing 404')
    notFound()
  }
  
  console.log('BookingDetailsPage - Booking borrowerId:', booking.borrowerId)
  console.log('BookingDetailsPage - Booking ownerId:', booking.ownerId)
  
  // Check if user is authorized to view this booking
  const userId = session.user.id
  const isAuthorized = booking.borrowerId === userId || booking.ownerId === userId
  
  console.log('BookingDetailsPage - Is authorized:', isAuthorized)
  
  if (!isAuthorized) {
    console.log('BookingDetailsPage - User not authorized, redirecting to /dashboard/bookings')
    redirect("/dashboard/bookings")
  }
  
  const isOwner = booking.ownerId === userId
  const isBorrower = booking.borrowerId === userId
  const bookingStartDate = new Date(booking.startDate)
  const bookingEndDate = new Date(booking.endDate)
  const statusInfo = getStatusInfo(booking.status, bookingStartDate, bookingEndDate)
  const isService = booking.type === 'service'
  
  // Calculate rental duration and details
  const diffTime = Math.abs(bookingEndDate.getTime() - bookingStartDate.getTime())
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  
  // Calculate price breakdown
  const dailyRate = booking.item.price || 0
  const subtotal = isService ? dailyRate : dailyRate * diffDays
  const serviceFee = subtotal * 0.1 // 10% service fee
  const totalPrice = subtotal + serviceFee
  
  // Get other user info
  const otherUser = isOwner ? booking.borrower : booking.owner
  const currentUser = isOwner ? booking.owner : booking.borrower

  return (
    <div className="space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link 
            href="/dashboard/bookings" 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Mis reservas</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={isService ? `/services/${booking.item.id}` : `/items/${booking.item.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Ver {isService ? 'servicio' : 'artículo'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-lg border p-4 ${statusInfo.color}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {statusInfo.icon}
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">
              Estado de la reserva: {statusInfo.text}
            </h3>
            <p className="mt-1 text-sm opacity-90">
              {statusInfo.description}
            </p>
            <p className="mt-1 text-xs opacity-75">
              Reserva creada {getRelativeTime(booking.createdAt || new Date())} • ID: {booking.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-orange-600" />
            Progreso de la Reserva
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BookingTimeline
            currentStatus={booking.status as any}
            createdAt={new Date(booking.createdAt || new Date())}
            confirmedAt={booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? new Date(booking.updatedAt) : undefined}
            completedAt={booking.status === 'COMPLETED' ? new Date(booking.updatedAt) : undefined}
            cancelledAt={booking.status === 'CANCELLED' ? new Date(booking.updatedAt) : undefined}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Item Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                  {isService ? 'Servicio contratado' : 'Artículo alquilado'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative w-full md:w-64 h-48 rounded-lg overflow-hidden">
                    <Image
                      src={booking.item.images[0] || "/placeholder.svg"}
                      alt={booking.item.title}
                      fill
                      className="object-cover"
                    />
                    {booking.item.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        +{booking.item.images.length - 1} fotos
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{booking.item.title}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      {booking.item.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {booking.item.location}
                        </div>
                      )}
                      {dailyRate > 0 && (
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          ${dailyRate}{isService ? '' : '/día'}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <Button asChild variant="outline" className="w-full md:w-auto">
                        <Link href={isService ? `/services/${booking.item.id}` : `/items/${booking.item.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles completos
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rental Period Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  {isService ? 'Fecha del servicio' : 'Período de alquiler'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isService ? (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Fecha programada</p>
                    <p className="font-semibold">{formatDate(bookingStartDate)}</p>
                    <p className="text-xs text-gray-500">{getRelativeTime(bookingStartDate)}</p>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Fecha de inicio</p>
                    <p className="font-semibold">{formatDate(bookingStartDate)}</p>
                    <p className="text-xs text-gray-500">{getRelativeTime(bookingStartDate)}</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Duración</p>
                    <p className="font-semibold text-blue-600">{diffDays} día{diffDays !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-gray-500">Total del período</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Fecha de fin</p>
                    <p className="font-semibold">{formatDate(bookingEndDate)}</p>
                    <p className="text-xs text-gray-500">{getRelativeTime(bookingEndDate)}</p>
                  </div>
                </div>
                )}
              </CardContent>
            </Card>

            {/* User Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  {isOwner 
                    ? (isService ? 'Información del cliente' : 'Información del inquilino')
                    : (isService ? 'Información del prestador' : 'Información del propietario')
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={otherUser.profileImage || "/placeholder-user.jpg"}
                      alt={`${otherUser.firstName} ${otherUser.lastName}`}
                      fill
                      className="object-cover"
                    />
                    {otherUser.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Shield className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {otherUser.firstName} {otherUser.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {isOwner ? 'Inquilino' : 'Propietario del artículo'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/messages/${otherUser.id}`}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Enviar mensaje
                        </Link>
                      </Button>
                      
                      {otherUser.phone && (
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-2" />
                          Llamar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            
            {/* Action Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-600" />
                  Acciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BookingActions
                  booking={booking}
                  userId={userId}
                  isOwner={isOwner}
                  isBorrower={isBorrower}
                />
              </CardContent>
            </Card>



            {/* Quick Actions Card */}

          </div>
        </div>
      </div>
    )
}
