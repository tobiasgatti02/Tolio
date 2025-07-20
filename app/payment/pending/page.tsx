import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { Clock, ArrowLeft, RefreshCw, Info } from 'lucide-react'
import Link from 'next/link'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface PendingPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function PendingContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/payment/pending')
  }

  const bookingId = typeof searchParams.booking_id === 'string' ? searchParams.booking_id : null

  if (!bookingId) {
    redirect('/dashboard')
  }

  // Buscar la reserva
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      item: {
        include: {
          owner: true
        }
      },
      payment: true,
      borrower: true
    }
  })

  if (!booking || booking.borrowerId !== session.user.id) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Icono de pendiente */}
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pago en proceso
          </h1>
          
          <p className="text-gray-600 mb-6">
            Tu pago está siendo procesado. Te notificaremos cuando se complete la transacción.
          </p>

          {/* Detalles de la reserva */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Detalles de la reserva</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <span className="font-medium w-20">Artículo:</span>
                <span>{booking.item.title}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <span className="font-medium w-20">Fechas:</span>
                <span>
                  {booking.startDate.toLocaleDateString()} - {booking.endDate.toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <span className="font-medium w-20">Total:</span>
                <span className="font-semibold">
                  ${booking.totalPrice.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <span className="font-medium w-20">Estado:</span>
                <span className="text-yellow-600 font-medium">En proceso</span>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 text-left">
                <p className="font-medium mb-1">¿Qué significa esto?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Tu pago está siendo verificado</li>
                  <li>Puede tomar hasta 24 horas</li>
                  <li>Recibirás una notificación cuando se complete</li>
                  <li>La reserva está temporalmente bloqueada</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Estado de procesamiento */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-yellow-800 font-medium">Procesando pago...</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors inline-flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar estado
            </button>
            
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al panel
            </Link>
          </div>

          {/* Nota de tiempo */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Si el pago no se procesa en 24 horas, puedes intentar nuevamente o contactarnos en{' '}
              <a href="mailto:soporte@tolio.com" className="text-emerald-600 hover:underline">
                soporte@tolio.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function PaymentPendingPage({ searchParams }: PendingPageProps) {
  const resolvedSearchParams = await searchParams
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <PendingContent searchParams={resolvedSearchParams} />
    </Suspense>
  )
}
