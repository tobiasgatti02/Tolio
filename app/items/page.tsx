"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Star, MapPin, Filter, Search, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

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
  rating: number;
  reviews: number;
  location: string;
  features: string[];
  images: string[];
  description: string;
}

interface ItemsPageProps {
  initialCategories: Category[];
}

const sortOptions = [
  { value: "relevance", label: "Relevancia" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "rating", label: "Mejor valorados" },
  { value: "newest", label: "Más recientes" },
]

export default function ItemsPage(){
  const searchParams = useSearchParams()
  const router = useRouter()

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance")

  // UI states
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  // Fetch items when search params change
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true)
      try {
        // Build the query string from searchParams
        const response = await fetch(`/api/items?${searchParams.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch items')
        }
        
        const items = await response.json()
        setFilteredItems(items)
      } catch (error) {
        console.error('Error fetching items:', error)
        setFilteredItems([])
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
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
  
    fetchCategories() // Actually call the function
  }, [])
  
  // Update search parameters and navigate
  const updateSearchParams = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())

    // Update or remove parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })

    // Navigate to new URL immediately
    router.push(`/items?${newParams.toString()}`)
  }

  // Auto-update when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateSearchParams({
        search: searchTerm,
        location: location,
        category: selectedCategory,
        minPrice: minPrice,
        maxPrice: maxPrice,
        sort: sortBy,
      })
    }, 300) // Debounce for 300ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm, location, selectedCategory, minPrice, maxPrice, sortBy])

  // Handle search form submission (mantener para compatibilidad)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Los filtros ya se aplican automáticamente
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setLocation("")
    setSelectedCategory("")
    setMinPrice("")
    setMaxPrice("")
    setSortBy("relevance")
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search bar mejorado */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-emerald-500" />
            <input
              type="text"
              placeholder="¿Qué necesitas alquilar?"
              className="w-full px-4 py-3 pl-10 rounded-lg border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative md:w-1/3">
            <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-emerald-500" />
            <input
              type="text"
              placeholder="Ciudad, barrio..."
              className="w-full px-4 py-3 pl-10 rounded-lg border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="relative md:w-1/4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Mobile filters */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <Filter className="h-5 w-5 mr-2 text-gray-500" />
              <span>Filtros</span>
            </div>
            {isFilterOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {isFilterOpen && (
            <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.nombre}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio por día ($)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Sort by */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop filters */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
            <h2 className="text-lg font-bold mb-4">Filtros</h2>

            {/* Category */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Categoría</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="all-categories"
                    type="radio"
                    name="category"
                    checked={selectedCategory === ""}
                    onChange={() => setSelectedCategory("")}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                  />
                  <label htmlFor="all-categories" className="ml-2 text-sm text-gray-700">
                    Todas las categorías
                  </label>
                </div>
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      id={`category-${category.id}`}
                      type="radio"
                      name="category"
                      checked={selectedCategory === category.nombre}
                      onChange={() => setSelectedCategory(category.nombre)}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                    />
                    <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-700">
                      {category.nombre}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Precio por día ($)</h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Sort by */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Ordenar por</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          {/* Results info bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="mb-2 sm:mb-0">
              <h1 className="text-xl font-bold">Artículos disponibles</h1>
              <p className="text-sm text-gray-500">{filteredItems.length} resultados</p>
            </div>

            {/* Active filters */}
            <div className="flex flex-wrap gap-2">
              {searchParams.get("search") && (
                <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <span>Búsqueda: {searchParams.get("search")}</span>
                  <button
                    onClick={() => updateSearchParams({ search: null })}
                    className="ml-1 text-emerald-600 hover:text-emerald-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {searchParams.get("location") && (
                <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <span>Ubicación: {searchParams.get("location")}</span>
                  <button
                    onClick={() => updateSearchParams({ location: null })}
                    className="ml-1 text-emerald-600 hover:text-emerald-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {searchParams.get("category") && (
                <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <span>Categoría: {searchParams.get("category")}</span>
                  <button
                    onClick={() => updateSearchParams({ category: null })}
                    className="ml-1 text-emerald-600 hover:text-emerald-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {(searchParams.get("minPrice") || searchParams.get("maxPrice")) && (
                <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <span>
                    Precio:
                    {searchParams.get("minPrice") ? ` ${searchParams.get("minPrice")}$` : " 0$"}
                    {" - "}
                    {searchParams.get("maxPrice") ? `${searchParams.get("maxPrice")}$` : "máx"}
                  </span>
                  <button
                    onClick={() => updateSearchParams({ minPrice: null, maxPrice: null })}
                    className="ml-1 text-emerald-600 hover:text-emerald-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
              <span className="ml-2 text-gray-600">Cargando resultados...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron resultados</h3>
              <p className="text-gray-500 mb-4">Prueba con otros términos de búsqueda o filtros.</p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Link key={item.id} href={`/items/${item.id}`} className="group">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="relative h-48 w-full">
                      <Image
                        src={item.images[0] || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="text-xs font-medium text-emerald-600 mb-1">
                        {item.category}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center mb-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium ml-1">{item.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({item.reviews} reseñas)</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.location}
                      </div>
                      <div className="mt-auto flex justify-between items-center">
                        <div className="text-gray-900 font-bold">
                          {item.price}$<span className="text-gray-500 font-normal text-sm">/día</span>
                        </div>
                        <div className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Disponible</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}