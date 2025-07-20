"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"

interface ItemGalleryProps {
  images: string[]
}

export default function ItemGallery({ images }: ItemGalleryProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [showFullscreen, setShowFullscreen] = useState(false)

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Imagen principal */}
        <div className="relative h-[500px] w-full rounded-xl overflow-hidden bg-gray-100 group">
          <Image 
            src={images[activeImage] || "/placeholder.svg"}
            alt="Item image" 
            fill 
            loading="lazy"
            className="object-contain hover:object-cover transition-all duration-300 cursor-zoom-in"
            onClick={() => setShowFullscreen(true)}
          />
          
          {/* Controles de navegación */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Botón de pantalla completa */}
          <button
            onClick={() => setShowFullscreen(true)}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Indicador de imagen */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {activeImage + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Miniaturas */}
        {images.length > 1 && (
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  activeImage === index 
                    ? "border-emerald-500 ring-2 ring-emerald-200" 
                    : "border-gray-200 hover:border-emerald-300 opacity-70 hover:opacity-100"
                }`}
              >
                <Image 
                  src={image || "/placeholder.svg"} 
                  alt={`Thumbnail ${index + 1}`} 
                  fill 
                  className="object-cover" 
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal de pantalla completa */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            <Image
              src={images[activeImage] || "/placeholder.svg"}
              alt="Item image fullscreen"
              fill
              className="object-contain"
              priority
            />
            
            {/* Controles del modal */}
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 text-xl z-10"
            >
              ×
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 z-10"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 z-10"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
              {activeImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

