"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Send, ArrowLeft, User, ChevronDown, Wrench } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import MaterialPaymentCard from "@/components/chat/material-payment-card"
import PaymentRequestMessage from "@/components/chat/payment-request-message"
import PaymentGateway from "@/components/payment-gateway"
import MaterialPaymentRequestForm from "@/components/material-payment-request-form"

interface Message {
  id: string
  content: string
  createdAt: string
  isRead: boolean
  senderId: string
  receiverId: string
  bookingId?: string
  sender: {
    id: string
    firstName: string
    lastName: string
    profileImage: string | null
  }
}

interface UserInfo {
  id: string
  firstName: string
  lastName: string
  profileImage: string | null
}

interface ChatClientProps {
  otherUserId: string
}

interface ActiveBooking {
  id: string
  status: string
  serviceId: string
  serviceTitle: string
  providerId: string
  clientId: string
  mayIncludeMaterials: boolean
  materialsPaid: boolean
  servicePaid: boolean
  totalPrice?: number
}

export default function ChatClient({ otherUserId }: ChatClientProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [otherUser, setOtherUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([])
  const [showMaterialForm, setShowMaterialForm] = useState(false)
  const [selectedBookingForMaterials, setSelectedBookingForMaterials] = useState<string | null>(null)
  const [paymentGateway, setPaymentGateway] = useState<{
    show: boolean
    paymentId?: string
    checkoutUrl?: string
    amount?: number
    type?: 'material' | 'service'
  }>({ show: false })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const prevMessagesLength = useRef(0)

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShouldAutoScroll(isNearBottom)
    }
  }

  useEffect(() => {
    fetchMessages()
    fetchOtherUser()
    fetchActiveBookings()
    
    // Polling cada 3 segundos para nuevos mensajes
    const interval = setInterval(fetchMessages, 50000)
    
    return () => clearInterval(interval)
  }, [otherUserId])

  useEffect(() => {
    // Solo hacer scroll automático si es la primera carga o si el usuario está cerca del bottom
    if (loading && messages.length > 0) {
      // Primera carga - ir al bottom inmediatamente
      scrollToBottom('auto')
    } else if (shouldAutoScroll && messages.length > prevMessagesLength.current) {
      // Solo scroll automático si hay nuevos mensajes y el usuario está cerca del bottom
      scrollToBottom()
    }
    prevMessagesLength.current = messages.length
  }, [messages, loading, shouldAutoScroll])

  const fetchOtherUser = async () => {
    try {
      const response = await fetch(`/api/users/${otherUserId}`)
      if (response.ok) {
        const userData = await response.json()
        setOtherUser(userData)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const fetchActiveBookings = async () => {
    try {
      const response = await fetch(`/api/chat/bookings/${otherUserId}`)
      if (response.ok) {
        const data = await response.json()
        setActiveBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching active bookings:', error)
    }
  }

  const handleMaterialsSubmit = async (materials: { name: string; price: number }[]) => {
    if (!selectedBookingForMaterials) return

    try {
      const response = await fetch('/api/payments/materials/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBookingForMaterials,
          materials,
        }),
      })

      if (response.ok) {
        alert('Solicitud de materiales enviada')
        setShowMaterialForm(false)
        setSelectedBookingForMaterials(null)
        fetchMessages()
        fetchActiveBookings()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'No se pudo enviar la solicitud'}`)
      }
    } catch (error) {
      console.error('Error requesting materials:', error)
      alert('Error al solicitar materiales')
    }
  }

  const initializeServicePayment = async (bookingId: string) => {
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          type: 'SERVICE',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentGateway({
          show: true,
          paymentId: data.paymentId,
          checkoutUrl: data.checkoutUrl,
          amount: data.amount,
          type: 'service',
        })
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'No se pudo iniciar el pago'}`)
      }
    } catch (error) {
      console.error('Error initializing payment:', error)
      alert('Error al iniciar el pago')
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${otherUserId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        
        // Marcar mensajes como leídos
        const unreadMessages = data.filter((msg: Message) => 
          !msg.isRead && msg.senderId === otherUserId
        )
        if (unreadMessages.length > 0) {
          markMessagesAsRead(unreadMessages.map((msg: Message) => msg.id))
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsRead = async (messageIds: string[]) => {
    try {
      await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageIds }),
      })
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    setSending(true)
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          receiverId: otherUserId,
        }),
      })

      if (response.ok) {
        setNewMessage("")
        setShouldAutoScroll(true) // Asegurar que haga scroll cuando envías un mensaje
        fetchMessages() // Refrescar mensajes
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100dvh-64px)] flex flex-col bg-gray-50">
        <div className="bg-white border-b px-3 py-2 flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="flex-1 p-3 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className="bg-gray-200 rounded-lg p-2 max-w-xs animate-pulse">
                <div className="h-3 bg-gray-300 rounded mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100dvh-64px)] flex flex-col bg-gray-50 relative">
      {/* Header compacto */}
      <div className="bg-white border-b px-3 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center min-w-0">
          <Link href="/messages" className="mr-2 p-1 hover:bg-gray-100 rounded-full shrink-0">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          
          <div className="flex items-center min-w-0">
            <div className="h-8 w-8 rounded-full overflow-hidden mr-2 shrink-0">
              {otherUser?.profileImage ? (
                <Image
                  src={otherUser.profileImage}
                  alt={`${otherUser.firstName} ${otherUser.lastName}`}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-medium text-gray-900 text-sm truncate">
                {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Cargando...'}
              </h1>
              {activeBookings.length > 0 && (
                <p className="text-xs text-gray-500 truncate">
                  {activeBookings[0].serviceTitle}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Botón de materiales solo cuando aplica */}
        {activeBookings.map(booking => {
          const isProvider = booking.providerId === session?.user?.id
          
          if (isProvider && booking.status === 'CONFIRMED' && booking.mayIncludeMaterials && !booking.materialsPaid) {
            return (
              <button
                key={booking.id}
                onClick={() => {
                  setSelectedBookingForMaterials(booking.id)
                  setShowMaterialForm(true)
                }}
                className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 shrink-0"
                title="Solicitar pago de materiales"
              >
                <Wrench className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Materiales</span>
              </button>
            )
          }
          return null
        })}
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-2"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="text-center py-6">
            <User className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">
              Comienza la conversación
            </h3>
            <p className="text-sm text-gray-500">
              Envía un mensaje para comenzar a chatear
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === session?.user?.id
            
            // Try to parse message content as JSON for special message types
            let messageData: any = null
            try {
              messageData = JSON.parse(message.content)
            } catch {
              // Not JSON, regular message
            }

            // Check if it's a material payment request
            if (messageData?.type === 'material_payment_request') {
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <MaterialPaymentCard
                    materials={messageData.materials}
                    totalAmount={messageData.totalAmount}
                    status={messageData.status || 'pending'}
                    materialPaymentId={messageData.materialPaymentId}
                    bookingId={message.bookingId || ''}
                    onPay={!isOwnMessage ? async () => {
                      // Initialize payment
                      try {
                        const response = await fetch('/api/payments/initialize', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            bookingId: message.bookingId,
                            type: 'MATERIAL',
                          }),
                        })

                        if (response.ok) {
                          const data = await response.json()
                          setPaymentGateway({
                            show: true,
                            paymentId: data.paymentId,
                            checkoutUrl: data.checkoutUrl,
                            amount: data.amount,
                            type: 'material',
                          })
                        } else {
                          const error = await response.json()
                          alert(error.error || 'Error al iniciar el pago')
                        }
                      } catch (error) {
                        console.error('Error initiating payment:', error)
                        alert('Error al iniciar el pago')
                      }
                    } : undefined}
                  />
                </div>
              )
            }

            // Check if it's a service payment request
            if (messageData?.type === 'service_payment_request') {
              const booking = activeBookings.find(b => b.id === message.bookingId)
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <PaymentRequestMessage
                    serviceTitle={messageData.serviceTitle || booking?.serviceTitle || 'Servicio'}
                    amount={messageData.amount || booking?.totalPrice || 0}
                    isPaid={messageData.isPaid || booking?.servicePaid || false}
                    onPay={!isOwnMessage && !booking?.servicePaid ? () => {
                      if (message.bookingId) {
                        initializeServicePayment(message.bookingId)
                      }
                    } : undefined}
                  />
                </div>
              )
            }

            // Regular message
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 border rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p className={`text-[10px] mt-0.5 ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                      locale: es
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Botón flotante para ir al final */}
      {!shouldAutoScroll && (
        <div className="absolute bottom-16 right-4">
          <button
            onClick={() => {
              setShouldAutoScroll(true)
              scrollToBottom()
            }}
            className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Message Input - más compacto */}
      <div className="bg-white border-t px-3 py-2 shrink-0">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={sending}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Payment Gateway Modal */}
      {paymentGateway.show && paymentGateway.checkoutUrl && (
        <PaymentGateway
          paymentId={paymentGateway.paymentId!}
          checkoutUrl={paymentGateway.checkoutUrl}
          amount={paymentGateway.amount!}
          type={paymentGateway.type!}
          onSuccess={() => {
            setPaymentGateway({ show: false })
            fetchMessages() // Refresh messages to update payment status
            fetchActiveBookings()
          }}
          onCancel={() => {
            setPaymentGateway({ show: false })
          }}
        />
      )}

      {/* Material Payment Request Form Modal */}
      {showMaterialForm && selectedBookingForMaterials && (
        <MaterialPaymentRequestForm
          bookingId={selectedBookingForMaterials}
          onSubmit={handleMaterialsSubmit}
          onCancel={() => {
            setShowMaterialForm(false)
            setSelectedBookingForMaterials(null)
          }}
        />
      )}
    </div>
  )
}
