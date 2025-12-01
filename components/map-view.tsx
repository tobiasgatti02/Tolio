"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { MapPin, ExternalLink } from "lucide-react"

// Importar Leaflet dinámicamente para evitar problemas con SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

interface MapViewProps {
  latitude: number
  longitude: number
  title?: string
  location?: string
  height?: string
}

export default function MapView({
  latitude,
  longitude,
  title,
  location,
  height = "300px",
}: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [customIcon, setCustomIcon] = useState<any>(null)

  useEffect(() => {
    setIsMounted(true)
    
    // Crear icono personalizado después del montaje
    import("leaflet").then((L) => {
      const icon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position: relative; width: 40px; height: 40px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#f97316" stroke="#ea580c" stroke-width="1.5"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      })
      setCustomIcon(icon)
    })
  }, [])

  // URL para abrir en Google Maps
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`

  if (!isMounted) {
    return (
      <div 
        className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border border-gray-300"
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2 animate-pulse" />
          <p className="text-sm">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height }}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        dragging={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {customIcon && (
          <Marker position={[latitude, longitude]} icon={customIcon}>
            <Popup>
              <div className="text-center">
                {title && <p className="font-semibold text-gray-900">{title}</p>}
                {location && <p className="text-sm text-gray-600">{location}</p>}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Botón para abrir en Google Maps */}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-[1000] bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg shadow-md text-sm font-medium flex items-center gap-2 transition-colors border border-gray-200"
      >
        <ExternalLink className="w-4 h-4" />
        Abrir en Google Maps
      </a>
    </div>
  )
}
