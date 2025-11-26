"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useLocale } from 'next-intl'
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { Star, MapPin, Filter, Search, Loader2, Wrench, Plus, Map as MapIcon, List } from "lucide-react"
import RadiusControl from "@/components/radius-control"

// Importar MapSearchView dinámicamente
const MapSearchView = dynamic(() => import("@/components/map-search-view"), { ssr: false })

interface Category {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
}

interface Item {
  id: string;
  title: string;
  category: string;
  price: number;
  priceType?: string;
  averageRating: number;
  reviewCount: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  distance?: number;
  features: string[];
  images: string[];
  description: string;
  owner?: {
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
}

const sortOptions = [
  { value: "relevance", label: "Relevancia" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "rating", label: "Mejor valorados" },
  { value: "newest", label: "Más recientes" },
]

export default function ItemsPage() {
  const locale = useLocale()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance")
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
  // Map states
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [radius, setRadius] = useState(10)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/items?${searchParams.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch items')
        const data = await response.json()
        setItems(data)
      } catch (error) {
        console.error('Error fetching items:', error)
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchItems()
  }, [searchParams])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categorias')
        if (!response.ok) throw new Error('Failed to fetch categories')
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const updateSearchParams = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") newParams.delete(key)
      else newParams.set(key, value)
    })
    router.push(`/items?${newParams.toString()}`)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateSearchParams({
        search: searchTerm,
        location: location,
        category: selectedCategory,
        minPrice: minPrice,
        maxPrice: maxPrice,
        sort: sortBy,
        userLat: userLocation ? userLocation.lat.toString() : null,
        userLng: userLocation ? userLocation.lng.toString() : null,
        radius: userLocation ? radius.toString() : null,
      })
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, location, selectedCategory, minPrice, maxPrice, sortBy, userLocation, radius])

  // Get user location
  const getUserLocation = () => {
    setIsLoadingLocation(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error)
          alert("No se pudo obtener tu ubicación. Verifica los permisos del navegador.")
          setIsLoadingLocation(false)
        }
      )
    } else {
      alert("Tu navegador no soporta geolocalización")
      setIsLoadingLocation(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setLocation("")
    setSelectedCategory("")
    setMinPrice("")
    setMaxPrice("")
    setSortBy("relevance")
    setUserLocation(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Herramientas en Alquiler</h1>
              <p className="text-emerald-100 text-lg">Encuentra las herramientas que necesitas para tu proyecto</p>
            </div>
            <Link href={`/${locale}/items/nuevo`} className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Publicar Herramienta
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input type="text" placeholder="Buscar herramientas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input type="text" placeholder="Ubicación..." value={location} onChange={(e) => setLocation(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="md:hidden bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className={`lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </h3>
                {(searchTerm || location || selectedCategory || minPrice || maxPrice) && (
                  <button onClick={clearFilters} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">Limpiar</button>
                )}
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option value="">Todas las categorías</option>
                    {categories.map(cat => (<option key={cat.id} value={cat.nombre}>{cat.nombre}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio por día ($)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      min="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      min="0"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              {/* Radius Control */}
              <div className="mt-6 pt-6 border-t">
                <RadiusControl
                  radius={radius}
                  onRadiusChange={setRadius}
                  userLocation={userLocation}
                  onGetLocation={getUserLocation}
                  isLoadingLocation={isLoadingLocation}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{items.length}</span> herramientas encontradas
              </p>
              
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    viewMode === 'list'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <List className="h-4 w-4" />
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    viewMode === 'map'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <MapIcon className="h-4 w-4" />
                  Mapa
                </button>
                
                {/* Sort */}
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  {sortOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg">
                <Wrench className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron herramientas</h3>
                <p className="text-gray-600 mb-6">Intenta ajustar tus filtros o sé el primero en publicar una herramienta</p>
                <Link href={`/${locale}/items/nuevo`} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                  <Plus className="h-5 w-5" />
                  Publicar mi Herramienta
                </Link>
              </div>
            ) : viewMode === 'map' ? (
              <MapSearchView
                items={items.map(item => ({
                  id: item.id,
                  title: item.title,
                  latitude: item.latitude || 0,
                  longitude: item.longitude || 0,
                  price: item.price,
                  priceType: "day",
                  category: item.category,
                  distance: item.distance,
                  images: item.images
                }))}
                userLocation={userLocation}
                radius={radius}
                onItemClick={(id) => router.push(`/${locale}/items/${id}`)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Link href={`/${locale}/items/${item.id}`} key={item.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <Image src={item.images[0] || "/placeholder.svg"} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-4">
                      <div className="text-xs font-medium text-emerald-600 mb-1">{item.category}</div>
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                      <div className="flex items-center mb-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium ml-1">{(item.averageRating || 0).toFixed(1)}</span>
                        <span className="text-xs text-gray-500 ml-1">({item.reviewCount || 0} reseñas)</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.location}
                      </div>
                      {item.distance !== undefined && (
                        <div className="text-xs text-emerald-600 font-medium mb-2">
                          📍 {item.distance.toFixed(1)} km de distancia
                        </div>
                      )}
                      {item.owner && (
                        <div className="flex items-center gap-2 mb-2">
                          {item.owner.profileImage ? (
                            <Image src={item.owner.profileImage} alt={`${item.owner.firstName} ${item.owner.lastName}`} width={24} height={24} className="rounded-full" />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-300" />
                          )}
                          <span className="text-xs text-gray-600">{item.owner.firstName} {item.owner.lastName}</span>
                        </div>
                      )}
                      <div className="mt-auto flex justify-between items-center">
                        <div className="text-gray-900 font-bold">${item.price}<span className="text-gray-500 font-normal text-sm">/día</span></div>
                        <div className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Disponible</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
