"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useLocale } from 'next-intl'
import Link from "next/link"
import Image from "next/image"
import { Star, MapPin, Filter, Search, Loader2, Briefcase, Plus, Award } from "lucide-react"

interface Service {
  id: string;
  title: string;
  category: string;
  pricePerHour: number | null;
  averageRating: number;
  reviewCount: number;
  location: string;
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

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/services?${searchParams.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch services')
        const data = await response.json()
        setServices(data)
      } catch (error) {
        console.error('Error fetching services:', error)
        setServices([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchServices()
  }, [searchParams])

  const updateSearchParams = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") newParams.delete(key)
      else newParams.set(key, value)
    })
    router.push(`/services?${newParams.toString()}`)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateSearchParams({
        search: searchTerm,
        location: location,
        category: selectedCategory,
        professional: isProfessionalOnly ? "true" : null,
        sort: sortBy,
      })
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, location, selectedCategory, isProfessionalOnly, sortBy])

  const clearFilters = () => {
    setSearchTerm("")
    setLocation("")
    setSelectedCategory("")
    setIsProfessionalOnly(false)
    setSortBy("relevance")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Servicios Profesionales</h1>
              <p className="text-blue-100 text-lg">Encuentra el profesional ideal para tu proyecto</p>
            </div>
            <Link href={`/${locale}/services/nuevo`} className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2">
              <Plus className="h-5 w-5" />
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
              <input type="text" placeholder="Buscar servicios..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input type="text" placeholder="Ubicación..." value={location} onChange={(e) => setLocation(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
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
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Todas las categorías</option>
                    {serviceCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={isProfessionalOnly} onChange={(e) => setIsProfessionalOnly(e.target.checked)} className="rounded text-blue-600 mr-2" />
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Award className="h-4 w-4 text-blue-600" />
                      Solo matriculados
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{services.length}</span> servicios encontrados
              </p>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {sortOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
              </select>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Link href={`/${locale}/services/${service.id}`} key={service.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <Image src={service.images[0] || "/placeholder-service.jpg"} alt={service.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      {service.isProfessional && (
                        <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Matriculado
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="text-xs font-medium text-blue-600 mb-1">{service.category}</div>
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                      <div className="flex items-center mb-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium ml-1">{service.averageRating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 ml-1">({service.reviewCount} reseñas)</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {service.location}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {service.provider.profileImage ? (
                          <Image src={service.provider.profileImage} alt={`${service.provider.firstName} ${service.provider.lastName}`} width={24} height={24} className="rounded-full" />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gray-300" />
                        )}
                        <span className="text-xs text-gray-600">{service.provider.firstName} {service.provider.lastName}</span>
                      </div>
                      <div className="mt-auto flex justify-between items-center">
                        <div className="text-gray-900 font-bold">{service.pricePerHour ? `$${service.pricePerHour}/hora` : "A convenir"}</div>
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Disponible</div>
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
