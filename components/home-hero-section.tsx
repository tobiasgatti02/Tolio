"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useLocale } from 'next-intl'
import { Search, Clock, Shield, Wrench, Briefcase, Plus } from "lucide-react"
import PublishModal from "@/components/ui/publish-modal"

export default function HomeHeroSection() {
  const { data: session } = useSession()
  const locale = useLocale()
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10 w-full">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white mb-6 md:mb-8 drop-shadow-2xl leading-tight animate-fade-in-up">
            Conecta con Oficios<br />y Herramientas
          </h1>
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-10 md:mb-16 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200 px-2">
            Publicá tu servicio, ofrecé herramientas o encontrá lo que necesitás en tu comunidad
          </p>
          {/* Main Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center mb-12 md:mb-20 animate-fade-in-up animation-delay-400 px-2">
            <Link 
              href={`/${locale}/services`}
              className="group relative bg-white hover:bg-gray-50 text-gray-900 px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-8 rounded-2xl md:rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 w-full md:w-auto md:min-w-[400px]">
              <div className="flex items-center justify-center space-x-3 sm:space-x-4 md:space-x-5">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 sm:p-4 md:p-5 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                  <Briefcase className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-0.5 md:mb-1">Buscar Servicios</h3>
                  <p className="text-gray-600 text-sm md:text-base">Plomeros, electricistas, pintores...</p>
                </div>
              </div>
            </Link>
            <Link 
              href={`/${locale}/items`}
              className="group relative bg-white hover:bg-gray-50 text-gray-900 px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-8 rounded-2xl md:rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 w-full md:w-auto md:min-w-[400px]">
              <div className="flex items-center justify-center space-x-3 sm:space-x-4 md:space-x-5">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 sm:p-4 md:p-5 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                  <Wrench className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-0.5 md:mb-1">Alquilar Herramientas</h3>
                  <p className="text-gray-600 text-sm md:text-base">Taladros, escaleras, equipos...</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Botón de Publicar */}
          <div className="animate-fade-in-up animation-delay-500 mb-8 md:mb-12 px-2">
            {session ? (
              <button
                onClick={() => setIsPublishModalOpen(true)}
                className="inline-flex items-center gap-2 sm:gap-3 bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                Publicar mi servicio o herramienta
              </button>
            ) : (
              <Link
                href={`/${locale}/signup`}
                className="inline-flex items-center gap-2 sm:gap-3 bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                Publicar mi servicio o herramienta
              </Link>
            )}
          </div>

          {/* Feature Icons */}
     
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        </div>
      </section>

      {/* Publish Modal */}
      <PublishModal 
        isOpen={isPublishModalOpen} 
        onClose={() => setIsPublishModalOpen(false)} 
      />
    </>
  )
}
