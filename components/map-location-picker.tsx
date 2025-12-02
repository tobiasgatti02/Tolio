"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { MapPin, Loader2, Navigation } from "lucide-react"
import type { LatLngExpression } from "leaflet"

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

interface MapLocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  initialLat?: number
  initialLng?: number
  height?: string
}

export default function MapLocationPicker({
  onLocationSelect,
  initialLat = -38.7183, // Bahía Blanca por defecto
  initialLng = -62.2663,
  height = "400px",
}: MapLocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [MapEvents, setMapEvents] = useState<any>(null)
  const [customIcon, setCustomIcon] = useState<any>(null)

  useEffect(() => {
    setIsMounted(true)
    // Cargar useMapEvents y crear icono personalizado después del montaje
    Promise.all([
      import("react-leaflet"),
      import("leaflet")
    ]).then(([reactLeaflet, L]) => {
      const MapEventsComponent = () => {
        reactLeaflet.useMapEvents({
          click: (e: any) => {
            handleMapClick(e.latlng.lat, e.latlng.lng)
          },
        })
        return null
      }
      setMapEvents(() => MapEventsComponent)
      
      // Crear icono personalizado - color naranja del tema
      // Usando iconAnchor correcto para que el pin apunte exactamente a la ubicación
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
        iconAnchor: [20, 40], // Centro horizontal, parte inferior del pin
        popupAnchor: [0, -40],
      })
      setCustomIcon(icon)
    })
  }, [])

  useEffect(() => {
    // Añadir reglas CSS puntuales para asegurarnos que el mapa y sus controles
    // no sobrepasen el navbar. Creamos un style tag y lo limpiamos al desmontar.
    const style = document.createElement('style')
    style.innerHTML = `
      /* Limitar z-index de elementos leaflet dentro del contenedor local */
      .map-container .leaflet-container { z-index: 0 !important; position: relative !important; }
      .map-container .leaflet-control { z-index: 1 !important; }
      .map-container { isolation: isolate; overflow: hidden; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setPosition([lat, lng])
      onLocationSelect(lat, lng)
      
      // Opcional: Obtener dirección usando Nominatim (geocoding inverso)
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          if (data.display_name) {
            onLocationSelect(lat, lng, data.display_name)
          }
        })
        .catch(err => console.error("Error obteniendo dirección:", err))
    },
    [onLocationSelect]
  )

  const handleUseMyLocation = () => {
    setIsLoading(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setPosition([lat, lng])
          onLocationSelect(lat, lng)
          setIsLoading(false)
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error)
          alert("No se pudo obtener tu ubicación. Por favor, haz click en el mapa.")
          setIsLoading(false)
        }
      )
    } else {
      alert("Tu navegador no soporta geolocalización")
      setIsLoading(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="map-container map-loading flex items-center justify-center" style={{ height }}>
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-3 z-0">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <MapPin className="inline h-4 w-4 mr-1" />
          Haz click en el mapa para seleccionar la ubicación exacta
        </p>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          Usar mi ubicación
        </button>
      </div>

      <div className="map-container rounded-lg overflow-hidden border-2 border-gray-200 shadow-md" style={{ height }}>
        <MapContainer
          center={(position || [initialLat, initialLng]) as LatLngExpression}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {MapEvents && <MapEvents />}
          {position && customIcon && <Marker position={position as LatLngExpression} icon={customIcon} />}
        </MapContainer>
      </div>

      
    </div>
  )
}
