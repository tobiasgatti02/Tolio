"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { MessageCircle, Search, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Conversation {
  id: string
  lastMessage: {
    id: string
    content: string
    createdAt: string
    isRead: boolean
  }
  otherUser: {
    id: string
    firstName: string
    lastName: string
    profileImage: string | null
  }
  unreadCount: number
}

export default function MessagesClient() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(conversation =>
    `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Mensajes</h1>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center p-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold mb-4">Mensajes</h1>
          
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="divide-y">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No se encontraron conversaciones" : "No tienes mensajes aún"}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? "Intenta con otro término de búsqueda"
                  : "Cuando contactes con otros usuarios, sus conversaciones aparecerán aquí"
                }
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.otherUser.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      {conversation.otherUser.profileImage ? (
                        <Image
                          src={conversation.otherUser.profileImage}
                          alt={`${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-medium ${conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                          addSuffix: true,
                          locale: es
                        })}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
