"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix para los iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

interface LocationMapProps {
  latitude?: number
  longitude?: number
  onLocationSelect?: (lat: number, lng: number, address: string) => void
  editable?: boolean
  height?: string
  zoom?: number
}

// Componente para centrar el mapa cuando cambian las coordenadas
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], map.getZoom())
  }, [lat, lng, map])
  return null
}

// Componente para manejar clicks en el mapa
function MapClickHandler({ 
  onLocationSelect, 
  editable 
}: { 
  onLocationSelect?: (lat: number, lng: number, address: string) => void
  editable: boolean 
}) {
  useMapEvents({
    click: async (e) => {
      if (!editable || !onLocationSelect) return

      const { lat, lng } = e.latlng

      try {
        // Reverse geocoding usando Nominatim (gratuito)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        )
        const data = await response.json()
        
        const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        onLocationSelect(lat, lng, address)
      } catch (error) {
        console.error("Error al obtener la dirección:", error)
        onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      }
    },
  })
  return null
}

export default function LocationMap({
  latitude = -34.6037, // Buenos Aires por defecto
  longitude = -58.3816,
  onLocationSelect,
  editable = false,
  height = "400px",
  zoom = 13,
}: LocationMapProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg" style={{ height }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-sm mb-1">📍 Ubicación seleccionada</p>
              <p className="text-xs text-gray-600">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
        <RecenterMap lat={latitude} lng={longitude} />
        <MapClickHandler onLocationSelect={onLocationSelect} editable={editable} />
      </MapContainer>

      {editable && (
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200 z-[1000]">
          <p className="text-xs font-semibold text-gray-700">
            📍 Haz clic en el mapa para seleccionar ubicación
          </p>
        </div>
      )}
    </div>
  )
}
