import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { CheckCircle, ArrowLeft, Calendar, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function SuccessContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/payment/success')
  }

  const bookingId = typeof searchParams.booking_id === 'string' ? searchParams.booking_id : null
  const paymentId = typeof searchParams.payment_id === 'string' ? searchParams.payment_id : null
  const merchantOrderId = typeof searchParams.merchant_order_id === 'string' ? searchParams.merchant_order_id : null

  if (!bookingId) {
    redirect('/dashboard')
  }

  // Buscar la reserva y el pago
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
          {/* Icono de éxito */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Pago exitoso!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Tu pago ha sido procesado correctamente y la reserva ha sido confirmada.
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
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-medium w-16">Fechas:</span>
                <span>
                  {booking.startDate.toLocaleDateString()} - {booking.endDate.toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <CreditCard className="w-4 h-4 mr-2" />
                <span className="font-medium w-16">Total:</span>
                <span className="font-semibold text-emerald-600">
                  ${booking.totalPrice.toLocaleString()}
                </span>
              </div>
              
              {paymentId && (
                <div className="flex items-center text-gray-600">
                  <span className="font-medium w-20">ID Pago:</span>
                  <span className="text-xs font-mono">{paymentId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Próximos pasos:</strong><br />
              • Recibirás una confirmación por email<br />
              • El propietario ha sido notificado<br />
              • Puedes contactar al propietario desde tu panel
            </p>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Link
              href={`/bookings/${booking.id}`}
              className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors inline-block"
            >
              Ver detalles de la reserva
            </Link>
            
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedSearchParams = await searchParams
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Procesando pago...</p>
        </div>
      </div>
    }>
      <SuccessContent searchParams={resolvedSearchParams} />
    </Suspense>
  )
}
