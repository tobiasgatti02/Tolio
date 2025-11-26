"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2, MapPin, Star, Calendar, Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Item {
  id: string
  title: string
  description: string
  category: string
  price: number
  deposit: number
  location: string
  latitude: number | null
  longitude: number | null
  images: string[]
  features: string[]
  isAvailable: boolean
  owner: {
    id: string
    name: string
    image: string | null
  }
  averageRating: number
  reviewCount: number
}

export default function ItemDetailPage() {
  const params = useParams()
  const id = params.id as string
  const locale = params.locale as string
  
  const [item, setItem] = useState<Item | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetch(`/api/items/${id}`)
        .then(res => {
          if (!res.ok) throw new Error("Item not found")
          return res.json()
        })
        .then(data => {
          setItem(data)
          setIsLoading(false)
        })
        .catch(err => {
          setError(err.message)
          setIsLoading(false)
        })
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando artículo...</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Artículo no encontrado</h1>
          <p className="text-gray-600 mb-4">El artículo que buscas no existe o ha sido eliminado.</p>
          <Link href={`/${locale}/items`} className="text-emerald-600 hover:text-emerald-700 font-medium">
            ← Volver a artículos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}/items`} className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a artículos
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div>
              {item.images.length > 0 ? (
                <div className="relative h-96 rounded-xl overflow-hidden">
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center">
                  <p className="text-gray-500">Sin imagen</p>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="text-sm text-emerald-600 font-medium mb-2">{item.category}</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="ml-1 font-medium">{item.averageRating.toFixed(1)}</span>
                    <span className="ml-1 text-gray-500">({item.reviewCount} reseñas)</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {item.location}
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg mb-6">
                  <div className="text-3xl font-bold text-emerald-700">
                    ${item.price}<span className="text-lg font-normal text-gray-600">/día</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <Shield className="inline h-4 w-4 mr-1" />
                    Depósito: ${item.deposit}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Descripción</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
              </div>

              {item.features.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Características</h2>
                  <ul className="space-y-2">
                    {item.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <span className="text-emerald-600 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-6 border-t">
                <button className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                  Reservar ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
