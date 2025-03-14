"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
export default function HeroSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

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

    // Navigate to new URL
    router.push(`/items?${newParams.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearchParams({
      search: searchTerm,
      location: location,
    })
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 max-w-3xl mx-auto">
      <div className="relative flex-grow">
        <input
          type="text"
          placeholder="Que necesitas?"
          className="w-full px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="relative md:w-1/3">
        <input
          type="text"
          placeholder="Ubicación"
          className="w-full px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg flex items-center justify-center"
      >
        <Search className="h-5 w-5 mr-2" />
        Búsqueda
      </button>
    </form>
  )
}

