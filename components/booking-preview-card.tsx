"use client"

import Link from "next/link"
import { Calendar, Clock, CheckCircle, User, MessageCircle, Eye, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface BookingPreviewCardProps {
  booking: {
    id: string
    item: {
      nombre: string
      imagenes: string[]
      type?: 'item' | 'service'
    }
    borrower?: {
      id: string
      name: string
    }
    owner?: {
      id: string
      name: string
    }
    fechaInicio: string
    fechaFin: string
    total: number
    status: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA'
    userRole: 'borrower' | 'owner'
  }
}

export default function BookingPreviewCard({ booking }: BookingPreviewCardProps) {
  const otherUser = booking.userRole === 'owner' ? booking.borrower : booking.owner
  
  const getStatusColor = () => {
    switch (booking.status) {
      case 'CONFIRMADA':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'COMPLETADA':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'CANCELADA':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusText = () => {
    switch (booking.status) {
      case 'CONFIRMADA':
        return 'Confirmada'
      case 'PENDIENTE':
        return 'Pendiente'
      case 'COMPLETADA':
        return 'Completada'
      case 'CANCELADA':
        return 'Cancelada'
      default:
        return booking.status
    }
  }

  const getProgressPercentage = () => {
    switch (booking.status) {
      case 'PENDIENTE':
        return 33
      case 'CONFIRMADA':
        return 66
      case 'COMPLETADA':
        return 100
      case 'CANCELADA':
        return 100
      default:
        return 0
    }
  }

  const formatDateRange = () => {
    const start = new Date(booking.fechaInicio)
    const end = new Date(booking.fechaFin)
    return `${format(start, "d MMM", { locale: es })} - ${format(end, "d MMM", { locale: es })}`
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="p-4">
        {/* Header with image and title */}
        <div className="flex items-start gap-4 mb-4">
          {/* Item image */}
          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <img
              src={booking.item.imagenes[0] || '/placeholder.jpg'}
              alt={booking.item.nombre}
              className="w-full h-full object-cover"
            />
            {/* Type badge */}
            <div className={`absolute top-1 right-1 px-2 py-0.5 rounded text-xs font-bold text-white ${
              booking.item.type === 'service' ? 'bg-purple-600' : 'bg-blue-600'
            }`}>
              {booking.item.type === 'service' ? 'S' : 'H'}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 truncate mb-1 group-hover:text-orange-600 transition-colors">
              {booking.item.nombre}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="truncate">{formatDateRange()}</span>
            </div>
            {/* User info */}
            {otherUser && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {otherUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-gray-600 truncate">
                  {booking.userRole === 'owner' ? 'Prestatario' : 'Prestador'}: {otherUser.name}
                </span>
              </div>
            )}
          </div>

          {/* Status badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-bold border-2 whitespace-nowrap ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>

        {/* Visual progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span className="font-medium">Progreso</span>
            <span className="font-bold">{getProgressPercentage()}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                booking.status === 'CANCELADA'
                  ? 'bg-gradient-to-r from-red-400 to-red-600'
                  : booking.status === 'COMPLETADA'
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                  : booking.status === 'CONFIRMADA'
                  ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                  : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Mini timeline */}
        <div className="flex items-center justify-between mb-4 px-2">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              booking.status !== 'PENDIENTE'
                ? 'bg-emerald-500 border-emerald-600 text-white'
                : 'bg-yellow-500 border-yellow-600 text-white'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-gray-600 mt-1">Solicitada</span>
          </div>

          {/* Line 1 */}
          <div className={`flex-1 h-1 mx-1 rounded ${
            booking.status === 'CONFIRMADA' || booking.status === 'COMPLETADA'
              ? 'bg-emerald-500'
              : 'bg-gray-200'
          }`} />

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              booking.status === 'CONFIRMADA' || booking.status === 'COMPLETADA'
                ? 'bg-blue-500 border-blue-600 text-white'
                : 'bg-gray-200 border-gray-300 text-gray-400'
            }`}>
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-gray-600 mt-1">Confirmada</span>
          </div>

          {/* Line 2 */}
          <div className={`flex-1 h-1 mx-1 rounded ${
            booking.status === 'COMPLETADA'
              ? 'bg-emerald-500'
              : 'bg-gray-200'
          }`} />

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              booking.status === 'COMPLETADA'
                ? 'bg-emerald-500 border-emerald-600 text-white'
                : booking.status === 'CANCELADA'
                ? 'bg-red-500 border-red-600 text-white'
                : 'bg-gray-200 border-gray-300 text-gray-400'
            }`}>
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-gray-600 mt-1">Completada</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/dashboard/bookings/${booking.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium text-sm transition-all shadow-md hover:shadow-lg"
          >
            <Eye className="w-4 h-4" />
            Ver detalles
            <ArrowRight className="w-4 h-4" />
          </Link>
          {otherUser && (
            <Link
              href={`/messages/${otherUser.id}`}
              className="flex items-center justify-center px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
