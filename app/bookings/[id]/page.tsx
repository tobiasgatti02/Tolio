import { getBookingById, handleReservationStatus } from "@/app/api/booking/route"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { 
  Calendar, Clock, CreditCard, CheckCircle, 
  XCircle, User, MessageCircle, ChevronLeft 
} from "lucide-react"
import CancelBookingButton from "@/components/cancelBookingButton"
import BookingActions from "../../../components/booking-actions"
import { BookingStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

// Helper function to format dates safely
const formatDate = (date: Date | string | undefined) => {
  if (!date) return "Fecha no disponible"
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, "d 'de' MMMM, yyyy", { locale: es })
}

interface BookingDetails {
  id: string
  startDate: Date
  endDate: Date
  status: BookingStatus
  totalPrice: number
  reviewId?: string
  item: {
    id: string
    title: string
    price: number
    images: string[]
  }
  owner: {
    id: string
    firstName: string
    lastName: string
    profileImage: string | null
  }
  borrower: {
    id: string
    firstName: string
    lastName: string
    profileImage: string | null
  }
  ownerId: string
  borrowerId: string
}

// Helper function to get status information
const getStatusInfo = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return {
        color: "bg-green-100 text-green-800",
        text: "Confirmado",
        icon: <CheckCircle className="h-5 w-5 mr-2" />,
      }
    case "PENDING":
      return {
        color: "bg-yellow-100 text-yellow-800",
        text: "Pendiente",
        icon: <Clock className="h-5 w-5 mr-2" />,
      }
    case "COMPLETED":
      return {
        color: "bg-blue-100 text-blue-800",
        text: "Completado",
        icon: <CheckCircle className="h-5 w-5 mr-2" />,
      }
    case "CANCELLED":
      return {
        color: "bg-red-100 text-red-800",
        text: "Cancelado",
        icon: <XCircle className="h-5 w-5 mr-2" />,
      }
    default:
      return {
        color: "bg-gray-100 text-gray-800",
        text: "Desconocido",
        icon: null,
      }
  }
}

export default async function BookingDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/signin?callbackUrl=/bookings/" + params.id)
  }
  
  const booking = await getBookingById(params.id) as BookingDetails | null
  
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
  const statusInfo = getStatusInfo(booking.status)
  
  // Calculate rental duration
  const startDate = new Date(booking.startDate)
  const endDate = new Date(booking.endDate)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  // Calculate price breakdown
  const dailyRate = booking.item.price
  const subtotal = dailyRate * diffDays
  const serviceFee = booking.totalPrice - subtotal

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link 
          href="/dashboard/bookings" 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver a mis reservas
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold">Detalles de la reserva</h1>
          <div className={`flex items-center px-4 py-2 rounded-full ${statusInfo.color}`}>
            {statusInfo.icon}
            <span className="font-medium">{statusInfo.text}</span>
          </div>
        </div>

        <div className="md:flex">
          {/* Item Details */}
          <div className="md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-200">
            <h2 className="text-lg font-medium mb-4">Información del artículo</h2>
            
            <div className="mb-6 relative h-60 rounded-lg overflow-hidden">
              <Image
                src={booking.item.images[0] || "/placeholder.svg"}
                alt={booking.item.title}
                fill
                className="object-cover"
              />
            </div>
            
            <h3 className="text-xl font-bold mb-2">{booking.item.title}</h3>
            
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Período de reserva</p>
                <p className="font-medium">
                  {formatDate(startDate)} - {formatDate(endDate)}
                </p>
                <p className="text-sm text-gray-500">
                  {diffDays} {diffDays === 1 ? 'día' : 'días'}
                </p>
              </div>
            </div>

            <Link
              href={`/items/${booking.item.id}`}
              className="block text-center bg-white border border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg font-medium"
            >
              Ver detalles del artículo
            </Link>
          </div>

          {/* Booking Details */}
          <div className="md:w-1/2 p-6">
            <h2 className="text-lg font-medium mb-4">Información de la reserva</h2>
            
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
                  {isOwner ? (
                    <Image
                      src={booking.borrower.profileImage || "/placeholder.svg"}
                      alt={`${booking.borrower.firstName} ${booking.borrower.lastName}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src={booking.owner.profileImage || "/placeholder.svg"}
                      alt={`${booking.owner.firstName} ${booking.owner.lastName}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {isOwner ? (
                      `${booking.borrower.firstName} ${booking.borrower.lastName}`
                    ) : (
                      `${booking.owner.firstName} ${booking.owner.lastName}`
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isOwner ? 'Solicitante' : 'Propietario'}
                  </p>
                </div>
              </div>
              <Link
                href={isOwner ? `/users/${booking.borrowerId}` : `/users/${booking.ownerId}`}
                className="text-emerald-600 hover:text-emerald-800"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>

            <div className="mt-6 space-y-2 border-t border-b border-gray-200 py-4 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">${dailyRate} x {diffDays} días</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Comisión de servicio</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-bold">
                <span>Total</span>
                <span>${booking.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <BookingActions
                booking={booking}
                userId={userId}
                isOwner={isOwner}
                isBorrower={isBorrower}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}