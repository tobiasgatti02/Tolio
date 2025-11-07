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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    fetchMessages()
    fetchOtherUser()
    
    // Polling cada 10 segundos para nuevos mensajes (menos frecuente)
    const interval = setInterval(fetchMessages, 10000)
    
    return () => clearInterval(interval)
  }, [otherUserId])

  useEffect(() => {
    // Solo hacer scroll automático en la primera carga
    if (loading && messages.length > 0) {
      // Primera carga - ir al bottom inmediatamente
      scrollToBottom('auto')
    }
  }, [messages, loading])

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
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white rounded-lg shadow-lg border overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center">
          <Link href="/messages" className="mr-3 p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
              {otherUser?.profileImage ? (
                <Image
                  src={otherUser.profileImage}
                  alt={`${otherUser.firstName} ${otherUser.lastName}`}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {otherUser ? `${otherUser.firstName[0]}${otherUser.lastName[0]}` : '?'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">
                {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Cargando...'}
              </h1>
              <p className="text-sm text-green-500">En línea</p>
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
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
        style={{ minHeight: 0 }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Comienza la conversación
            </h3>
            <p className="text-gray-500 text-sm">
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
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
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

      {/* Message Input */}
      <div className="bg-white border-t p-4 flex-shrink-0">
        <form onSubmit={sendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={sending}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
