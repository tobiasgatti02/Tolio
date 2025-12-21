"use client"

import type React from "react"

import { useState } from "react"
import { Briefcase, Search, Wrench } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SearchTarget = "items" | "services"
type HeroSearchVariant = "hero" | "navbar"

export default function HeroSearch({
  defaultTarget = "services",
  variant = "hero",
}: {
  defaultTarget?: SearchTarget
  variant?: HeroSearchVariant
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [target, setTarget] = useState<SearchTarget>(defaultTarget)
  const [isFlipping, setIsFlipping] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()

  const toggleTarget = () => {
    setIsFlipping(true)
    setTarget((prev) => (prev === "services" ? "items" : "services"))
    setTimeout(() => setIsFlipping(false), 550)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const newParams = new URLSearchParams(searchParams.toString())
    if (!searchTerm) newParams.delete("search")
    else newParams.set("search", searchTerm)

    const qs = newParams.toString()
    router.push(`/${locale}/${target}${qs ? `?${qs}` : ""}`)
  }

  return (
    <form onSubmit={handleSearch} className={variant === "navbar" ? "flex items-center gap-2 w-full" : "w-full"}>
      {variant === "navbar" ? (
        <>
          <div className="flex items-center rounded-full border border-gray-200 bg-white px-1 py-1">
            <button
              type="button"
              onClick={() => setTarget("services")}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                target === "services" ? "bg-[#3b82f6] text-white" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Servicios
            </button>
            <button
              type="button"
              onClick={() => setTarget("items")}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                target === "items" ? "bg-[#10b981] text-white" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Herramientas
            </button>
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              placeholder="¿Qué necesitás?"
              className={`w-full px-4 py-2 rounded-full border focus:outline-none ${
                target === "services"
                  ? "border-[#bfdbfe] focus:ring-2 focus:ring-[#3b82f6]"
                  : "border-[#bbf7d0] focus:ring-2 focus:ring-[#10b981]"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={`px-4 py-2 rounded-full flex items-center justify-center text-white ${
              target === "services" ? "bg-[#3b82f6] hover:bg-[#2563eb]" : "bg-[#10b981] hover:bg-[#059669]"
            }`}
            style={{ backgroundColor: target === "services" ? "#3b82f6" : "#10b981" }}
          >
            <Search className="h-5 w-5 mr-2" />
            Buscar
          </button>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* 3D Toggle */}
            <button
              type="button"
              onClick={toggleTarget}
              className="relative w-48 h-16 flex-shrink-0 rounded-xl overflow-hidden"
              style={{ perspective: "1000px" }}
              aria-label={`Cambiar a ${target === "services" ? "herramientas" : "servicios"}`}
            >
              <div
                className="relative w-full h-full transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: target === "services" ? "rotateY(0deg)" : "rotateY(180deg)",
                }}
              >
                {/* Front - Servicios */}
                <div
                  className="absolute inset-0 z-20 shadow-lg flex items-center justify-center gap-2 text-white font-semibold"
                  style={{
                    backgroundImage: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(0deg)",
                  }}
                >
                  <Briefcase className="h-5 w-5" />
                  <span>Servicios</span>
                </div>
                {/* Back - Herramientas */}
                <div
                  className="absolute inset-0 z-10 shadow-lg flex items-center justify-center gap-2 text-white font-semibold"
                  style={{
                    transform: "rotateY(180deg)",
                    backgroundImage: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <Wrench className="h-5 w-5" />
                  <span>Herramientas</span>
                </div>
              </div>
            </button>

            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${
                  target === "services" ? "text-[#3b82f6]" : "text-[#10b981]"
                }`}
              />
              <Input
                type="text"
                placeholder={
                  target === "services"
                    ? "Buscar plomeros, electricistas, pintores..."
                    : "Buscar taladros, escaleras, equipos..."
                }
                className="w-full h-14 pl-12 pr-4 text-base border-2 focus-visible:ring-0 rounded-xl bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="px-6 py-3 rounded-xl flex items-center justify-center text-white transition-colors"
              style={{ backgroundColor: target === "services" ? "#3b82f6" : "#10b981" }}
            >
              Buscar
            </button>
          </div>

          {/* Helper Text */}
          <p className="mt-4 text-sm text-gray-500 text-center">
            {target === "services" ? <>Encontrá profesionales en tu área</> : <>Alquilá herramientas cerca de ti</>}
          </p>
        </div>
      )}
    </form>
  )
}

