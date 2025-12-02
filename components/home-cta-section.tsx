"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useLocale } from 'next-intl'
import { Plus } from "lucide-react"
import PublishModal from "@/components/ui/publish-modal"

export default function HomeCtaSection() {
  const { data: session } = useSession()
  const locale = useLocale()
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-20 bg-gradient-to-r from-emerald-600 to-teal-600 overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 md:left-20 w-64 md:w-96 h-64 md:h-96 bg-teal-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 md:right-20 w-56 md:w-80 h-56 md:h-80 bg-emerald-400/20 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-white/5 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10 px-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 md:mb-8 leading-tight">¿Listo para empezar<br />con Tolio?</h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            Sumate a miles de usuarios que ya están ahorrando dinero y reduciendo residuos 
            al compartir en lugar de comprar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center px-4 sm:px-0">
            {!session && (
              <Link
                href={`/${locale}/signup`}
                className="bg-white text-emerald-600 hover:bg-gray-50 px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base sm:text-lg md:text-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Registrarte gratis
              </Link>
            )}
            {session && (
              <button
                onClick={() => setIsPublishModalOpen(true)}
                className="bg-white text-emerald-600 hover:bg-gray-50 px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base sm:text-lg md:text-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5 md:h-6 md:w-6" />
                Publicar ahora
              </button>
            )}
            <Link
              href={`/${locale}/items`}
              className="bg-emerald-700 text-white hover:bg-emerald-800 border-2 border-white/30 px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base sm:text-lg md:text-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Explorar artículos
            </Link>
          </div>
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
