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
import PaymentButton from "@/components/payment-button"

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

interface BookingDetails {
  id: string
  startDate: Date
  endDate: Date
  status: BookingStatus
  totalPrice: number
  reviewId?: string
  createdAt: Date
  item: {
    id: string
    title: string
    description?: string
    price: number
    images: string[]
    location?: string
    ownerId: string
  }
  owner: {
    id: string
    firstName: string
    lastName: string
    profileImage: string | null
    email?: string
    phone?: string
    verified?: boolean
  }
  borrower: {
    id: string
    firstName: string
    lastName: string
    profileImage: string | null
    email?: string
    phone?: string
    verified?: boolean
  }
  ownerId: string
  borrowerId: string
}

// Helper function to get status information
const getStatusInfo = (status: string, startDate: Date, endDate: Date) => {
  const now = new Date()
  const isActive = isAfter(now, startDate) && isBefore(now, endDate)
  
  switch (status) {
    case "CONFIRMED":
      return {
        color: isActive ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-green-100 text-green-800 border-green-200",
        text: isActive ? "En curso" : "Confirmado",
        icon: <CheckCircle className="h-4 w-4 mr-1" />,
        description: isActive ? "El alquiler está actualmente en curso" : "Reserva confirmada y lista para comenzar"
      }
    case "PENDING":
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        text: "Pendiente",
        icon: <Clock className="h-4 w-4 mr-1" />,
        description: "Esperando confirmación del propietario"
      }
    case "COMPLETED":
      return {
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        text: "Completado",
        icon: <CheckCircle className="h-4 w-4 mr-1" />,
        description: "Alquiler finalizado exitosamente"
      }
    case "CANCELLED":
      return {
        color: "bg-red-100 text-red-800 border-red-200",
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

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    const { id } = await params
    redirect("/signin?callbackUrl=/bookings/" + id)
  }
  
  const { id } = await params
  const booking = await getBookingById(id) as any
  
  if (!booking) {
    notFound()
  }
  
  // Check if user is authorized to view this booking
  const userId = session.user.id
  if (booking.borrowerId !== userId && booking.ownerId !== userId) {
    redirect("/dashboard/bookings")
  }
  
  const isOwner = booking.ownerId === userId
  const isBorrower = booking.borrowerId === userId
  const bookingStartDate = new Date(booking.startDate)
  const bookingEndDate = new Date(booking.endDate)
  const statusInfo = getStatusInfo(booking.status, bookingStartDate, bookingEndDate)
  
  // Calculate rental duration and details
  const diffTime = Math.abs(bookingEndDate.getTime() - bookingStartDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  // Calculate price breakdown
  const dailyRate = booking.item.price
  const subtotal = dailyRate * diffDays
  const serviceFee = booking.totalPrice - subtotal
  
  // Get other user info
  const otherUser = isOwner ? booking.borrower : booking.owner
  const currentUser = isOwner ? booking.owner : booking.borrower

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Ver artículo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className={`mb-8 rounded-lg border p-4 ${statusInfo.color}`}>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Item Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-emerald-600" />
                  Artículo alquilado
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
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        ${dailyRate}/día
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button asChild variant="outline" className="w-full md:w-auto">
                        <Link href={`/items/${booking.item.id}`}>
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
                  <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                  Período de alquiler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Fecha de inicio</p>
                    <p className="font-semibold">{formatDate(bookingStartDate)}</p>
                    <p className="text-xs text-gray-500">{getRelativeTime(bookingStartDate)}</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Duración</p>
                    <p className="font-semibold text-emerald-600">{diffDays} día{diffDays !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-gray-500">Total del período</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Fecha de fin</p>
                    <p className="font-semibold">{formatDate(bookingEndDate)}</p>
                    <p className="text-xs text-gray-500">{getRelativeTime(bookingEndDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-emerald-600" />
                  {isOwner ? 'Información del inquilino' : 'Información del propietario'}
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
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
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
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Enviar mensaje
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
                  <Info className="h-5 w-5 mr-2 text-emerald-600" />
                  Acciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Mostrar botón de pago solo si es el prestatario y la reserva está pendiente */}
                {isBorrower && booking.status === 'PENDING' && !booking.payment && (
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Tu reserva está pendiente de pago. Completa el pago para confirmarla.
                      </p>
                    </div>
                    <PaymentButton 
                      bookingId={booking.id}
                      amount={booking.totalPrice}
                    />
                  </div>
                )}
                
                {/* Si el pago está pendiente */}
                {isBorrower && booking.payment?.status === 'PENDING' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💳 Tu pago está siendo procesado. Te notificaremos cuando se complete.
                      </p>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/payment/pending">Ver estado del pago</Link>
                    </Button>
                  </div>
                )}
                
                {/* Si la reserva está confirmada */}
                {booking.status === 'CONFIRMED' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✅ Reserva confirmada. El pago ha sido procesado exitosamente.
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contactar al {isOwner ? 'inquilino' : 'propietario'}
                    </Button>
                  </div>
                )}
                
                {/* Botones generales */}
                <div className="space-y-2 mt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/items/${booking.item.id}`}>
                      <Package className="h-4 w-4 mr-2" />
                      Ver detalles del artículo
                    </Link>
                  </Button>
                  
                  {booking.status === 'COMPLETED' && (
                    <Button variant="outline" size="sm" className="w-full">
                      <Star className="h-4 w-4 mr-2" />
                      Dejar una reseña
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-emerald-600" />
                  Resumen de costos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">${dailyRate} × {diffDays} día{diffDays !== 1 ? 's' : ''}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Comisión de servicio</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-emerald-600">${booking.totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-emerald-800">
                      💡 El pago se procesa de forma segura a través de nuestra plataforma
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Guardar en favoritos
                </Button>
                
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Star className="h-4 w-4 mr-2" />
                  Ver perfil completo
                </Button>
                
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir reserva
                </Button>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">¿Necesitas ayuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Si tienes algún problema con esta reserva, contáctanos.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar soporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}