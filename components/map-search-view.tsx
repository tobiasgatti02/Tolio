"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import type { LatLngExpression } from "leaflet"

// Importar componentes de Leaflet dinámicamente
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
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
)

interface MapItem {
  id: string
  title: string
  latitude: number
  longitude: number
  price: number
  priceType?: string
  category: string
  distance?: number
  images?: string[]
}

interface MapSearchViewProps {
  items: MapItem[]
  userLocation: { lat: number; lng: number } | null
  radius: number
  onItemClick?: (itemId: string) => void
  height?: string
}

export default function MapSearchView({
  items,
  userLocation,
  radius,
  onItemClick,
  height = "600px",
}: MapSearchViewProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="map-container map-loading" style={{ height }}>
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  // Filtrar items que tienen coordenadas
  const itemsWithCoords = items.filter(
    (item) => item.latitude !== null && item.longitude !== null
  )

  // Determinar el centro del mapa
  const center: LatLngExpression = userLocation
    ? [userLocation.lat, userLocation.lng]
    : itemsWithCoords.length > 0
    ? [itemsWithCoords[0].latitude, itemsWithCoords[0].longitude]
    : [-38.7183, -62.2663] // Bahía Blanca por defecto

  return (
    <div className="map-container map-container-large" style={{ height }}>
      <MapContainer
        center={center}
        zoom={userLocation ? 12 : 10}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Círculo de radio si hay ubicación del usuario */}
        {userLocation && (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={radius * 1000} // Convertir km a metros
            pathOptions={{
              fillColor: "#059669",
              fillOpacity: 0.1,
              color: "#059669",
              weight: 2,
            }}
          />
        )}

        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              <div className="custom-popup">
                <h3>📍 Tu ubicación</h3>
                <p>Radio de búsqueda: {radius} km</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de items */}
        {itemsWithCoords.map((item) => (
          <Marker
            key={item.id}
            position={[item.latitude, item.longitude]}
            eventHandlers={{
              click: () => {
                if (onItemClick) {
                  onItemClick(item.id)
                }
              },
            }}
          >
            <Popup>
              <div className="custom-popup">
                <h3>{item.title}</h3>
                <p className="text-xs text-gray-500">{item.category}</p>
                {item.distance !== undefined && (
                  <p className="text-xs text-emerald-600">
                    📍 {item.distance.toFixed(1)} km de distancia
                  </p>
                )}
                <div className="price">
                  ${item.price}
                  {item.priceType && (
                    <span className="text-sm font-normal text-gray-600">
                      /{item.priceType === "hour" ? "hora" : "día"}
                    </span>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {itemsWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 pointer-events-none">
          <div className="text-center text-gray-500">
            <p className="font-medium">No hay items con ubicación en el mapa</p>
            <p className="text-sm">Los items sin coordenadas no se muestran aquí</p>
          </div>
        </div>
      )}
    </div>
  )
}
