"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef, memo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useLocale } from 'next-intl'
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { Star, MapPin, Filter, Search, Loader2, Wrench, Plus, Map as MapIcon, List } from "lucide-react"

// Lazy load heavy components
const RadiusControl = dynamic(() => import("@/components/radius-control"), {
  ssr: false,
  loading: () => <div className="h-24 bg-gray-100 animate-pulse rounded-lg" />
})

const MapSearchView = dynamic(() => import("@/components/map-search-view"), { 
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 animate-pulse rounded-lg" />
})

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

// Memoized skeleton component
const ItemCardSkeleton = memo(function ItemCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4">
        <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
        <div className="flex justify-between items-center mt-4">
          <div className="h-5 w-16 bg-gray-200 rounded" />
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  )
})

// Memoized item card to prevent unnecessary re-renders
const ItemCard = memo(function ItemCard({ 
  item, 
  locale, 
  priority 
}: { 
  item: Item
  locale: string
  priority: boolean 
}) {
  return (
    <Link 
      href={`/${locale}/items/${item.id}`} 
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
      prefetch={priority}
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <Image 
          src={item.images[0] || "/placeholder.svg"} 
          alt={item.title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading={priority ? "eager" : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <div className="text-xs font-medium text-emerald-600 mb-1">{item.category}</div>
        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">{item.title}</h3>
        <div className="flex items-center mb-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium ml-1">{(item.averageRating || 0).toFixed(1)}</span>
          <span className="text-xs text-gray-500 ml-1">({item.reviewCount || 0})</span>
        </div>
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>
        {item.distance !== undefined && (
          <div className="text-xs text-emerald-600 font-medium mb-2">
            📍 {item.distance.toFixed(1)} km
          </div>
        )}
        <div className="flex justify-between items-center">
          <div className="text-gray-900 font-bold text-sm">${item.price}/{item.priceType || 'día'}</div>
          <div className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Disponible</div>
        </div>
      </div>
    </Link>
  )
})

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
  
  // Track if this is the first render to avoid double fetch
  const isFirstRender = useRef(true)
  const hasUserInteracted = useRef(false)
  // AbortController for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch items with abort support
  useEffect(() => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    const controller = new AbortController()
    abortControllerRef.current = controller

    const fetchItems = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/items?${searchParams.toString()}`, {
          signal: controller.signal,
          cache: 'default',
        })
        if (!response.ok) throw new Error('Failed to fetch items')
        const data = await response.json()
        if (!controller.signal.aborted) {
          setItems(data)
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching items:', error)
          setItems([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }
    fetchItems()

    return () => controller.abort()
  }, [searchParams])

  // Fetch categories only once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categorias', { cache: 'force-cache' })
        if (!response.ok) throw new Error('Failed to fetch categories')
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const updateSearchParams = useCallback((params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") newParams.delete(key)
      else newParams.set(key, value)
    })
    router.push(`/items?${newParams.toString()}`)
  }, [searchParams, router])

  // Apply filters with debounce - only trigger when user interacts with filters
  useEffect(() => {
    // Skip first render - URL already has the initial params
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    
    // Only update URL if user has interacted with filters
    if (!hasUserInteracted.current) return
    
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
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, location, selectedCategory, minPrice, maxPrice, sortBy, userLocation, radius, updateSearchParams])

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
    hasUserInteracted.current = true
    setSearchTerm("")
    setLocation("")
    setSelectedCategory("")
    setMinPrice("")
    setMaxPrice("")
    setSortBy("relevance")
    setUserLocation(null)
  }

  // Helper to mark user interaction
  const handleFilterChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (value: T) => {
    hasUserInteracted.current = true
    setter(value)
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Herramientas en Alquiler</h1>
              <p className="text-emerald-100 text-base sm:text-lg">Encuentra las herramientas que necesitas para tu proyecto</p>
            </div>
            <Link href={`/${locale}/items/nuevo`} className="bg-white text-emerald-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2 text-sm sm:text-base">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
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
              <input type="text" placeholder="Buscar herramientas..." value={searchTerm} onChange={(e) => handleFilterChange(setSearchTerm)(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input type="text" placeholder="Ubicación..." value={location} onChange={(e) => handleFilterChange(setLocation)(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
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
                  <select value={selectedCategory} onChange={(e) => handleFilterChange(setSelectedCategory)(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
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
                      onChange={(e) => handleFilterChange(setMinPrice)(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      min="0"
                      value={maxPrice}
                      onChange={(e) => handleFilterChange(setMaxPrice)(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              {/* Radius Control */}
              <div className="mt-6 pt-6 border-t">
                <RadiusControl
                  radius={radius}
                  onRadiusChange={handleFilterChange(setRadius)}
                  userLocation={userLocation}
                  onGetLocation={getUserLocation}
                  isLoadingLocation={isLoadingLocation}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-gray-600 text-sm sm:text-base">
                <span className="font-semibold text-gray-900">{items.length}</span> herramientas encontradas
              </p>
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* View Toggle */}
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 sm:gap-2 text-sm ${
                    viewMode === 'list'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span className="hidden xs:inline">Lista</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 sm:gap-2 text-sm ${
                    viewMode === 'map'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <MapIcon className="h-4 w-4" />
                  <span className="hidden xs:inline">Mapa</span>
                </button>
                
                {/* Sort */}
                <select value={sortBy} onChange={(e) => handleFilterChange(setSortBy)(e.target.value)} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
                  {sortOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ItemCardSkeleton key={i} />
                ))}
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
                {items.map((item, index) => (
                  <Link href={`/${locale}/items/${item.id}`} key={item.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <Image 
                        src={item.images[0] || "/placeholder.svg"} 
                        alt={item.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading={index < 3 ? "eager" : "lazy"}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
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
