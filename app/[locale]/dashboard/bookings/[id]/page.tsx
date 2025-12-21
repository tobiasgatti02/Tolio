"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { 
  ChevronLeft, Calendar, Clock, CheckCircle, XCircle, 
  User, MessageCircle, MapPin, Package, Briefcase,
  AlertCircle, Wrench
} from "lucide-react"
import BookingTimeline from "@/components/dashboard/booking-timeline"
import MaterialRequestAlert from "@/components/dashboard/material-request-alert"
import MaterialRequestModal from "@/components/dashboard/material-request-modal"

interface MaterialItem {
  name: string
  price: number
}

interface MaterialPayment {
  id: string
  materials: MaterialItem[]
  totalAmount: number
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  requestedAt: string
}

interface BookingDetails {
  id: string
  status: string
  startDate: string
  endDate: string
  totalPrice: number
  createdAt: string
  updatedAt: string
  type: 'item' | 'service'
  item: {
    id: string
    title: string
    images: string[]
    price: number
    location?: string
  }
  borrower: {
    id: string
    firstName: string
    lastName: string
    profileImage: string | null
  }
  owner: {
    id: string
    firstName: string
    lastName: string
    profileImage: string | null
  }
  borrowerId: string
  ownerId: string
  mayIncludeMaterials?: boolean
  materialPayment?: MaterialPayment | null
  materialsPaid?: boolean
  servicePaid?: boolean
  priceType?: string
}

export default function BookingDetailsPageEnhanced() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [showMaterialModal, setShowMaterialModal] = useState(false)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    fetchBooking()
    fetchCurrentUser()
  }, [params.id])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      if (data?.user?.id) {
        setCurrentUserId(data.user.id)
      }
    } catch (err) {
      console.error('Error fetching user:', err)
    }
  }

  const fetchBooking = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/booking/${params.id}`)
      
      if (!res.ok) {
        if (res.status === 404) {
          setError('Reserva no encontrada')
        } else {
          setError('Error al cargar la reserva')
        }
        return
      }
      
      const data = await res.json()
      setBooking(data)
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'confirm' | 'reject' | 'complete') => {
    if (!booking) return
    
    setActionLoading(true)
    try {
      const res = await fetch(`/api/booking/${booking.id}/${action}`, {
        method: 'PATCH'
      })
      
      if (res.ok) {
        const actionMessages = {
          confirm: 'Reserva confirmada',
          reject: 'Reserva cancelada', 
          complete: 'Reserva completada'
        }
        showToast('success', actionMessages[action])
        
        // Si se completó, redirigir a mensajes con el otro usuario
        if (action === 'complete') {
          const otherUserId = userRole === 'provider' ? booking.borrower?.id : booking.owner?.id
          if (otherUserId) {
            router.push(`/messages/${otherUserId}`)
            return
          }
        }
        
        await fetchBooking()
      } else {
        const data = await res.json()
        showToast('error', data.error || 'Error al procesar la acción')
      }
    } catch (err) {
      showToast('error', 'Error de conexión')
    } finally {
      setActionLoading(false)
    }
  }

  const handleMaterialRequest = async (materials: MaterialItem[]) => {
    if (!booking) return
    
    setActionLoading(true)
    try {
      const res = await fetch('/api/payments/materials/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          materials: materials.map(m => ({ name: m.name, price: m.price }))
        })
      })
      
      if (res.ok) {
        showToast('success', 'Solicitud de materiales enviada')
        await fetchBooking()
      } else {
        const data = await res.json()
        showToast('error', data.error || 'Error al solicitar materiales')
      }
    } catch (err) {
      showToast('error', 'Error de conexión')
    } finally {
      setActionLoading(false)
    }
  }

  const handleMaterialApprove = async () => {
    if (!booking?.materialPayment) return
    
    // Redirect to payment flow
    router.push(`/booking/${booking.id}/payment?type=material`)
  }

  const handleMaterialReject = async () => {
    // TODO: Implement material request rejection
    showToast('error', 'Función de rechazo aún no implementada')
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-tolio-gray-900 mb-2">{error || 'Reserva no encontrada'}</h2>
          <Link href="/dashboard/bookings" className="text-tolio-orange-500 hover:underline">
            Volver a mis reservas
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = currentUserId === booking.ownerId
  const isBorrower = currentUserId === booking.borrowerId
  const otherUser = isOwner ? booking.borrower : booking.owner
  const isService = booking.type === 'service'
  const userRole = isOwner ? 'provider' : 'client'
  
  const startDate = new Date(booking.startDate)
  const endDate = new Date(booking.endDate)
  const days = Math.max(1, differenceInDays(endDate, startDate))

  // Material request logic
  const hasMaterialPayment = booking.materialPayment !== null && booking.materialPayment !== undefined
  const canRequestMaterials = isOwner && isService && booking.mayIncludeMaterials && !hasMaterialPayment && booking.status === 'CONFIRMED'
  const showMaterialAlert = hasMaterialPayment && booking.materialPayment!.status === 'PENDING'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
          toast.type === 'success' 
            ? 'bg-status-green-bg border border-status-green text-status-green-text' 
            : 'bg-status-red-bg border border-status-red text-status-red'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back button */}
        <Link 
          href="/dashboard/bookings" 
          className="inline-flex items-center text-gray-600 hover:text-tolio-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="font-medium">Volver a Reservas</span>
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={booking.item.images[0] || '/placeholder.jpg'}
                    alt={booking.item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-tolio-gray-900">{booking.item.title}</h1>
                  <p className="text-sm text-gray-500">
                    {isService ? 'Servicio' : 'Artículo'} • ID: {booking.id.slice(0, 8)}
                  </p>
                  {booking.item.location && (
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {booking.item.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="px-6 py-6">
            <BookingTimeline
              status={booking.status as 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'}
              createdAt={format(new Date(booking.createdAt), "d MMM, HH:mm", { locale: es })}
              confirmedAt={booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? format(new Date(booking.updatedAt), "d MMM, HH:mm", { locale: es }) : undefined}
              completedAt={booking.status === 'COMPLETED' ? format(new Date(booking.updatedAt), "d MMM, HH:mm", { locale: es }) : undefined}
            />
          </div>

          {/* Material Request Alert - PROMINENT */}
          {showMaterialAlert && booking.materialPayment && (
            <div className="px-6 pb-6">
              <MaterialRequestAlert
                userRole={userRole}
                materials={booking.materialPayment.materials.map((m: any) => ({
                  name: m.name,
                  price: m.price
                }))}
                totalAmount={booking.materialPayment.totalAmount}
                status={booking.materialPayment.status as 'PENDING' | 'APPROVED' | 'REJECTED'}
                onApprove={handleMaterialApprove}
                onReject={handleMaterialReject}
                isLoading={actionLoading}
              />
            </div>
          )}

          {/* Details Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dates */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {isService ? 'Fecha' : 'Período'}
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                {isService ? (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-tolio-gray-900">
                      {format(startDate, "d MMM yyyy", { locale: es })}
                    </p>
                    <p className="text-sm text-gray-500">Fecha programada</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-lg font-bold text-tolio-gray-900">
                        {format(startDate, "d MMM", { locale: es })}
                      </p>
                      <p className="text-xs text-gray-500">Inicio</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center px-4">
                      <div className="h-px flex-1 bg-gray-300"></div>
                      <span className="px-3 text-sm font-semibold text-tolio-orange-500">{days} día{days > 1 ? 's' : ''}</span>
                      <div className="h-px flex-1 bg-gray-300"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-tolio-gray-900">
                        {format(endDate, "d MMM", { locale: es })}
                      </p>
                      <p className="text-xs text-gray-500">Fin</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Other User */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                {isOwner ? (isService ? 'Cliente' : 'Inquilino') : (isService ? 'Prestador' : 'Propietario')}
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    {otherUser.profileImage ? (
                      <Image
                        src={otherUser.profileImage}
                        alt={`${otherUser.firstName} ${otherUser.lastName}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-tolio-orange-500 to-tolio-orange-600 flex items-center justify-center text-white font-bold">
                        {otherUser.firstName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-tolio-gray-900 truncate">
                      {otherUser.firstName} {otherUser.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isOwner ? (isService ? 'Cliente' : 'Inquilino') : (isService ? 'Prestador' : 'Propietario')}
                    </p>
                  </div>
                  <Link 
                    href={`/messages/${otherUser.id}`}
                    className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resumen de pago
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {isService ? 'Precio del servicio' : `Precio por ${days} día${days > 1 ? 's' : ''}`}
                      </p>
                      <p className="text-xs text-gray-500">Pago al completar (incluye comisión)</p>
                    </div>
                    <p className="text-xl font-bold text-tolio-gray-900">
                      ${booking.totalPrice ? booking.totalPrice.toLocaleString() : (booking.item.price * days).toLocaleString()}
                    </p>
                  </div>
                  {hasMaterialPayment && booking.materialPayment && (
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Materiales</p>
                        <p className="text-xs text-tolio-orange-500 font-medium">
                          {booking.materialPayment.status === 'PENDING' ? 'Pago pendiente' : 'Pago anticipado'} • Sin comisión
                        </p>
                      </div>
                      <p className="text-xl font-bold text-tolio-orange-500">
                        ${booking.materialPayment.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-lg font-bold text-tolio-gray-900">Total estimado</p>
                    <p className="text-3xl font-bold text-tolio-gray-900">
                      ${(booking.totalPrice + (hasMaterialPayment ? booking.materialPayment!.totalAmount : 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            {booking.status === 'PENDING' && isOwner && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center mb-4">
                  {otherUser.firstName} quiere {isService ? 'contratar tu servicio' : 'alquilar tu artículo'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction('confirm')}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-4 bg-status-green hover:bg-status-green-text text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-4 bg-status-red hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Rechazar
                  </button>
                </div>
              </div>
            )}

            {booking.status === 'CONFIRMED' && (
              <div className="space-y-3">
                {isOwner && (
                  <>
                    {canRequestMaterials && (
                      <button
                        onClick={() => setShowMaterialModal(true)}
                        className="w-full py-3 px-4 bg-tolio-orange-500 hover:bg-tolio-orange-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Wrench className="w-5 h-5" />
                        Solicitar Materiales
                      </button>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction('complete')}
                        disabled={actionLoading}
                        className="flex-1 py-3 px-4 bg-status-green hover:bg-status-green-text text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Completar
                      </button>
                      <button
                        onClick={() => handleAction('reject')}
                        disabled={actionLoading}
                        className="py-3 px-4 bg-status-red-bg hover:bg-red-200 text-status-red font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Cancelar
                      </button>
                    </div>
                  </>
                )}
                {isBorrower && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-status-green bg-status-green-bg px-4 py-2 rounded-lg mb-4">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Reserva confirmada - Lista para usar</span>
                    </div>
                    {showMaterialAlert && (
                      <p className="text-sm text-gray-500">
                        El proveedor ha solicitado pago de materiales. Por favor revisa la solicitud arriba.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {booking.status === 'COMPLETED' && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-status-green bg-status-green-bg px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Reserva completada exitosamente</span>
                </div>
              </div>
            )}

            {/* Contact button always visible */}
            <div className="mt-4">
              <Link
                href={`/messages/${otherUser.id}`}
                className="w-full py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Enviar mensaje a {otherUser.firstName}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Material Request Modal */}
      <MaterialRequestModal
        isOpen={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        userRole={userRole}
        existingMaterials={hasMaterialPayment && booking.materialPayment ? booking.materialPayment.materials.map((m: any) => ({ name: m.name, price: m.price })) : []}
        existingTotal={hasMaterialPayment && booking.materialPayment ? booking.materialPayment.totalAmount : 0}
        onSubmit={handleMaterialRequest}
        onApprove={handleMaterialApprove}
        onReject={handleMaterialReject}
      />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mb-6"></div>
        
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 flex items-start gap-4 border-b border-gray-100">
            <div className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="h-6 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
