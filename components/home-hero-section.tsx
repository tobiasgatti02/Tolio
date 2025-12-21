"use client"

import HeroSearch from "@/components/hero-search"

export default function HomeHeroSection() {
  return (
    <>
      <section
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fb8a3c] via-[#f97316] to-[#ea670c] px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-12 overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(135deg, #fb8a3c 0%, #f97316 50%, #ea670c 100%)',
        }}
      >
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
          <div className="mb-12 md:mb-20 animate-fade-in-up animation-delay-400 px-2">
            <div className="max-w-4xl mx-auto">
              <HeroSearch defaultTarget="services" variant="hero" />
            </div>
          </div>

          {/* Botón de Publicar */}
          <div className="animate-fade-in-up animation-delay-500 mb-8 md:mb-12 px-2" />

          {/* Feature Icons */}
     
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        </div>
      </section>

      {/* Publish Modal */}
      {false}
    </>
  )
}
