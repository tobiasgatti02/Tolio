"use client"

import { Check, Clock, XCircle, CheckCircle2 } from 'lucide-react'

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

interface BookingTimelineProps {
  currentStatus: BookingStatus
  createdAt: Date
  confirmedAt?: Date
  completedAt?: Date
  cancelledAt?: Date
}

interface Step {
  status: BookingStatus
  label: string
  icon: React.ReactNode
  date?: Date
}

export default function BookingTimeline({
  currentStatus,
  createdAt,
  confirmedAt,
  completedAt,
  cancelledAt
}: BookingTimelineProps) {
  
  const steps: Step[] = [
    {
      status: 'PENDING',
      label: 'Solicitud Enviada',
      icon: <Clock className="h-5 w-5" />,
      date: createdAt
    },
    {
      status: 'CONFIRMED',
      label: 'Confirmada',
      icon: <CheckCircle2 className="h-5 w-5" />,
      date: confirmedAt
    },
    {
      status: currentStatus === 'CANCELLED' ? 'CANCELLED' : 'COMPLETED',
      label: currentStatus === 'CANCELLED' ? 'Cancelada' : 'Completada',
      icon: currentStatus === 'CANCELLED' ? <XCircle className="h-5 w-5" /> : <Check className="h-5 w-5" />,
      date: currentStatus === 'CANCELLED' ? cancelledAt : completedAt
    },
  ]

  const getStepState = (stepStatus: BookingStatus): 'completed' | 'current' | 'upcoming' | 'cancelled' => {
    const statusOrder: BookingStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED']
    const currentIndex = statusOrder.indexOf(currentStatus)
    const stepIndex = statusOrder.indexOf(stepStatus)

    if (currentStatus === 'CANCELLED') {
      if (stepStatus === 'CANCELLED') return 'cancelled'
      if (stepStatus === 'PENDING') return 'completed'
      return 'upcoming'
    }

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'upcoming'
  }

  const formatDate = (date?: Date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="w-full py-8">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-8 left-0 w-full h-1 bg-gray-200 rounded-full" />
        
        {/* Active Progress Line */}
        <div 
          className={`absolute top-8 left-0 h-1 rounded-full transition-all duration-500 ${
            currentStatus === 'CANCELLED' 
              ? 'bg-red-500' 
              : currentStatus === 'COMPLETED'
              ? 'bg-emerald-500'
              : 'bg-orange-500'
          }`}
          style={{
            width: currentStatus === 'PENDING' 
              ? '0%' 
              : currentStatus === 'CONFIRMED' 
              ? '50%' 
              : '100%'
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const state = getStepState(step.status)
            const isHidden = currentStatus !== 'CANCELLED' && step.status === 'CANCELLED'
            
            if (isHidden) return null

            return (
              <div key={step.status} className="flex flex-col items-center flex-1">
                {/* Circle */}
                <div
                  className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                    state === 'completed'
                      ? 'bg-emerald-500 border-emerald-600 shadow-lg shadow-emerald-500/50'
                      : state === 'current'
                      ? 'bg-orange-500 border-orange-600 shadow-lg shadow-orange-500/50 animate-pulse'
                      : state === 'cancelled'
                      ? 'bg-red-500 border-red-600 shadow-lg shadow-red-500/50'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <div className={`${
                    state === 'upcoming' ? 'text-gray-400' : 'text-white'
                  }`}>
                    {step.icon}
                  </div>
                </div>

                {/* Label */}
                <div className="mt-4 text-center">
                  <p className={`text-sm font-semibold ${
                    state === 'completed'
                      ? 'text-emerald-600'
                      : state === 'current'
                      ? 'text-orange-600'
                      : state === 'cancelled'
                      ? 'text-red-600'
                      : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  {step.date && state !== 'upcoming' && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(step.date)}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Status Message */}
      <div className={`mt-8 p-4 rounded-xl border-2 ${
        currentStatus === 'PENDING'
          ? 'bg-orange-50 border-orange-200'
          : currentStatus === 'CONFIRMED'
          ? 'bg-blue-50 border-blue-200'
          : currentStatus === 'COMPLETED'
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <p className={`text-center font-medium ${
          currentStatus === 'PENDING'
            ? 'text-orange-800'
            : currentStatus === 'CONFIRMED'
            ? 'text-blue-800'
            : currentStatus === 'COMPLETED'
            ? 'text-emerald-800'
            : 'text-red-800'
        }`}>
          {currentStatus === 'PENDING' && '⏳ Esperando confirmación del propietario'}
          {currentStatus === 'CONFIRMED' && '✅ Reserva confirmada - Listo para usar'}
          {currentStatus === 'COMPLETED' && '🎉 Reserva completada exitosamente'}
          {currentStatus === 'CANCELLED' && '❌ Esta reserva fue cancelada'}
        </p>
      </div>
    </div>
  )
}
