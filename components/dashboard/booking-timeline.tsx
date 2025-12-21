"use client"

import { CheckCircle, Package, Clock } from "lucide-react"

interface BookingTimelineProps {
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  createdAt?: string
  confirmedAt?: string
  completedAt?: string
}

export default function BookingTimeline({ status, createdAt, confirmedAt, completedAt }: BookingTimelineProps) {
  const isPending = status === 'PENDING'
  const isConfirmed = status === 'CONFIRMED' || status === 'COMPLETED'
  const isCompleted = status === 'COMPLETED'
  const isCancelled = status === 'CANCELLED'

  if (isCancelled) {
    return (
      <div className="p-4 bg-status-red-bg border border-status-red rounded-lg">
        <p className="text-sm font-medium text-status-red">Esta reserva fue cancelada</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Progress bar */}
      <div className="absolute top-8 left-8 right-8 h-1 bg-gray-200">
        <div 
          className={`absolute h-full bg-tolio-orange-500 transition-all duration-500 ${
            isCompleted ? 'w-full' : isConfirmed ? 'w-2/3' : 'w-1/3'
          }`}
        />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-3 gap-4 relative">
        {/* Step 1: Solicitud enviada (completado) */}
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 relative z-10 ring-4 ring-white ${
            isPending || isConfirmed || isCompleted ? 'bg-status-green' : 'bg-gray-200'
          }`}>
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <p className={`font-semibold mb-1 ${isPending || isConfirmed || isCompleted ? 'text-tolio-gray-900' : 'text-gray-400'}`}>
            Solicitud Enviada
          </p>
          {createdAt && (
            <p className="text-xs text-gray-600">{createdAt}</p>
          )}
        </div>

        {/* Step 2: Confirmada (activo cuando confirmada) */}
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 relative z-10 ring-4 ring-white ${
            isConfirmed || isCompleted ? 'bg-tolio-orange-500 shadow-lg' : 'bg-gray-200'
          }`}>
            {isConfirmed || isCompleted ? (
              <Clock className="h-8 w-8 text-white" />
            ) : (
              <Clock className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <p className={`font-semibold mb-1 ${isConfirmed || isCompleted ? 'text-tolio-orange-500' : 'text-gray-400'}`}>
            Confirmada
          </p>
          {confirmedAt && (
            <p className="text-xs text-gray-600">{confirmedAt}</p>
          )}
          {isConfirmed && !isCompleted && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-tolio-orange-500">
              <div className="w-2 h-2 rounded-full bg-tolio-orange-500 animate-pulse" />
              En progreso
            </div>
          )}
        </div>

        {/* Step 3: Completada (pendiente) */}
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 relative z-10 ring-4 ring-white ${
            isCompleted ? 'bg-status-green' : 'bg-gray-200'
          }`}>
            <Package className={`h-8 w-8 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
          </div>
          <p className={`font-semibold mb-1 ${isCompleted ? 'text-tolio-gray-900' : 'text-gray-400'}`}>
            Completada
          </p>
          {completedAt ? (
            <p className="text-xs text-gray-600">{completedAt}</p>
          ) : (
            <p className="text-xs text-gray-600">Pendiente</p>
          )}
        </div>
      </div>
    </div>
  )
}
