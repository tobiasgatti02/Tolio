"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Send, ArrowLeft, User, MoreVertical, ChevronDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Message {
  id: string
  content: string
  createdAt: string
  isRead: boolean
  senderId: string
  receiverId: string
  sender: {
    id: string
    firstName: string
    lastName: string
    profileImage: string | null
  }
}

interface User {
  id: string
  firstName: string
  lastName: string
  profileImage: string | null
}

interface ChatClientProps {
  otherUserId: string
}

export default function ChatClient({ otherUserId }: ChatClientProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
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
    
    // Polling cada 3 segundos para nuevos mensajes
    const interval = setInterval(fetchMessages, 3000)
    
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
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="bg-white border-b px-4 py-3 flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className="bg-gray-200 rounded-lg p-3 max-w-xs animate-pulse">
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
    <div className="h-screen flex flex-col bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/messages" className="mr-3 p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full overflow-hidden mr-3">
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
            <div>
              <h1 className="font-medium text-gray-900">
                {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Cargando...'}
              </h1>
            </div>
          </div>
        </div>
        
        <button className="p-1 hover:bg-gray-100 rounded-full">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Comienza la conversación
            </h3>
            <p className="text-gray-500">
              Envía un mensaje para comenzar a chatear con {otherUser?.firstName}
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === session?.user?.id
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-gray-900 border'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-emerald-100' : 'text-gray-500'
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
        <div className="absolute bottom-20 right-6">
          <button
            onClick={() => {
              setShouldAutoScroll(true)
              scrollToBottom()
            }}
            className="bg-emerald-500 text-white p-3 rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-emerald-500 text-white p-2 rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
