"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useLocale } from 'next-intl'
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { Star, MapPin, Filter, Search, Loader2, Briefcase, Plus, Award, Map as MapIcon, List } from "lucide-react"

// Lazy load heavy components
const RadiusControl = dynamic(() => import("@/components/radius-control"), {
  ssr: false,
  loading: () => <div className="h-24 bg-gray-100 animate-pulse rounded-lg" />
})

const MapSearchView = dynamic(() => import("@/components/map-search-view"), { 
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 animate-pulse rounded-lg" />
})

interface Service {
  id: string;
  title: string;
  category: string;
  pricePerHour: number | null;
  priceType?: string;
  averageRating: number;
  reviewCount: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  distance?: number;
  images: string[];
  isProfessional: boolean;
  provider: {
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
}

const sortOptions = [
  { value: "relevance", label: "Relevancia" },
  { value: "price-low", label: "Precio: menor a mayor" },
  { value: "price-high", label: "Precio: mayor a menor" },
  { value: "rating", label: "Mejor valorados" },
]

const serviceCategories = [
  "Construcción", "Electricidad", "Plomería", "Pintura", "Jardinería",
  "Limpieza", "Mudanzas", "Reparaciones", "Carpintería", "Tecnología",
  "Diseño", "Educación", "Otros"
]

// Memoized skeleton to prevent re-renders
const ServiceCardSkeleton = memo(function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4">
        <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-6 rounded-full bg-gray-200" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-5 w-16 bg-gray-200 rounded" />
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  )
})

// Memoized service card component to prevent unnecessary re-renders
const ServiceCard = memo(function ServiceCard({ 
  service, 
  locale, 
  priority 
}: { 
  service: Service
  locale: string
  priority: boolean 
}) {
  return (
    <Link 
      href={`/${locale}/services/${service.id}`} 
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
      prefetch={priority}
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <Image 
          src={service.images[0] || "/placeholder-service.jpg"} 
          alt={service.title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading={priority ? "eager" : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {service.isProfessional && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Award className="h-3 w-3" />
            Matriculado
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs font-medium text-blue-600 mb-1">{service.category}</div>
        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{service.title}</h3>
        <div className="flex items-center mb-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium ml-1">{service.averageRating?.toFixed(1) || '0.0'}</span>
          <span className="text-xs text-gray-500 ml-1">({service.reviewCount || 0})</span>
        </div>
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{service.location}</span>
        </div>
        {service.distance !== undefined && (
          <div className="text-xs text-blue-600 font-medium mb-2">
            📍 {service.distance.toFixed(1)} km
          </div>
        )}
        <div className="flex items-center gap-2 mb-2">
          {service.provider.profileImage ? (
            <Image 
              src={service.provider.profileImage} 
              alt="" 
              width={24} 
              height={24} 
              className="rounded-full"
              loading="lazy"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-300 flex-shrink-0" />
          )}
          <span className="text-xs text-gray-600 truncate">
            {service.provider.firstName} {service.provider.lastName}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-gray-900 font-bold text-sm">
            {service.pricePerHour ? `$${service.pricePerHour}/h` : "A convenir"}
          </div>
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Disponible</div>
        </div>
      </div>
    </Link>
  )
})

export default function ServicesPage() {
  const locale = useLocale()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  const [isProfessionalOnly, setIsProfessionalOnly] = useState(searchParams.get("professional") === "true")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance")
  const [services, setServices] = useState<Service[]>([])
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

  // Fetch services with abort support
  useEffect(() => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    const controller = new AbortController()
    abortControllerRef.current = controller

    const fetchServices = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/services?${searchParams.toString()}`, {
          signal: controller.signal,
          // Enable browser cache
          cache: 'default',
        })
        if (!response.ok) throw new Error('Failed to fetch services')
        const data = await response.json()
        if (!controller.signal.aborted) {
          setServices(data)
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching services:', error)
          setServices([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }
    fetchServices()

    return () => controller.abort()
  }, [searchParams])

  const updateSearchParams = useCallback((params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") newParams.delete(key)
      else newParams.set(key, value)
    })
    router.push(`/services?${newParams.toString()}`)
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
        professional: isProfessionalOnly ? "true" : null,
        sort: sortBy,
        userLat: userLocation ? userLocation.lat.toString() : null,
        userLng: userLocation ? userLocation.lng.toString() : null,
        radius: userLocation ? radius.toString() : null,
      })
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, location, selectedCategory, isProfessionalOnly, sortBy, userLocation, radius, updateSearchParams])

  // Get user location - memoized callback
  const getUserLocation = useCallback(() => {
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
  }, [])

  const clearFilters = useCallback(() => {
    hasUserInteracted.current = true
    setSearchTerm("")
    setLocation("")
    setSelectedCategory("")
    setIsProfessionalOnly(false)
    setSortBy("relevance")
    setUserLocation(null)
  }, [])

  // Helper to mark user interaction - memoized
  const handleFilterChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (value: T) => {
    hasUserInteracted.current = true
    setter(value)
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Servicios Profesionales</h1>
              <p className="text-blue-100 text-base sm:text-lg">Encuentra el profesional ideal para tu proyecto</p>
            </div>
            <Link href={`/${locale}/services/nuevo`} className="bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm sm:text-base">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              Ofrecer Servicio
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input type="text" placeholder="Buscar servicios..." value={searchTerm} onChange={(e) => handleFilterChange(setSearchTerm)(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input type="text" placeholder="Ubicación..." value={location} onChange={(e) => handleFilterChange(setLocation)(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="md:hidden bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
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
                {(searchTerm || location || selectedCategory || isProfessionalOnly) && (
                  <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Limpiar</button>
                )}
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select value={selectedCategory} onChange={(e) => handleFilterChange(setSelectedCategory)(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Todas las categorías</option>
                    {serviceCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={isProfessionalOnly} onChange={(e) => handleFilterChange(setIsProfessionalOnly)(e.target.checked)} className="rounded text-blue-600 mr-2" />
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Award className="h-4 w-4 text-blue-600" />
                      Solo matriculados
                    </span>
                  </label>
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
                <span className="font-semibold text-gray-900">{services.length}</span> servicios encontrados
              </p>
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* View Toggle */}
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 sm:gap-2 text-sm ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
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
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <MapIcon className="h-4 w-4" />
                  <span className="hidden xs:inline">Mapa</span>
                </button>
                
                {/* Sort */}
                <select value={sortBy} onChange={(e) => handleFilterChange(setSortBy)(e.target.value)} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                  {sortOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg">
                <Briefcase className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron servicios</h3>
                <p className="text-gray-600 mb-6">Intenta ajustar tus filtros o sé el primero en ofrecer este servicio</p>
                <Link href={`/${locale}/services/nuevo`} className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  <Plus className="h-5 w-5" />
                  Ofrecer mi Servicio
                </Link>
              </div>
            ) : viewMode === 'map' ? (
              <MapSearchView
                items={services.map(service => ({
                  id: service.id,
                  title: service.title,
                  latitude: service.latitude || 0,
                  longitude: service.longitude || 0,
                  price: service.pricePerHour || 0,
                  priceType: "hour",
                  category: service.category,
                  distance: service.distance,
                  images: service.images
                }))}
                userLocation={userLocation}
                radius={radius}
                onItemClick={(id) => router.push(`/${locale}/services/${id}`)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    locale={locale}
                    priority={index < 3}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
