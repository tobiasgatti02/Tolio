"use client"

import { useState } from "react"
import { MapPin, Navigation, Loader2, Target } from "lucide-react"

interface RadiusControlProps {
  radius: number
  onRadiusChange: (radius: number) => void
  userLocation: { lat: number; lng: number } | null
  onGetLocation: () => void
  isLoadingLocation: boolean
}

export default function RadiusControl({
  radius,
  onRadiusChange,
  userLocation,
  onGetLocation,
  isLoadingLocation,
}: RadiusControlProps) {
  const [inputValue, setInputValue] = useState(radius.toString())

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setInputValue(value.toString())
    onRadiusChange(value)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 50) {
      onRadiusChange(numValue)
    }
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl shadow-sm border-2 border-emerald-200 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-600 rounded-lg">
            <Target className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Búsqueda por ubicación</h3>
            <p className="text-xs text-gray-600">Encuentra cerca de ti</p>
          </div>
        </div>
      </div>

      {!userLocation ? (
        <div className="text-center py-4 space-y-3">
          <p className="text-sm text-gray-600">Activa tu ubicación para buscar por radio</p>
          <button
            type="button"
            onClick={onGetLocation}
            disabled={isLoadingLocation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingLocation ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Obteniendo ubicación...
              </>
            ) : (
              <>
                <Navigation className="h-5 w-5" />
                Usar mi ubicación
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white p-3 rounded-lg border border-emerald-300 shadow-sm">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">Ubicación activa</p>
                <p className="text-xs text-gray-500 truncate">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-800">
                Radio de búsqueda
              </label>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border-2 border-emerald-300 shadow-sm">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="w-12 text-center font-bold text-emerald-700 bg-transparent border-none focus:outline-none"
                />
                <span className="text-sm font-medium text-gray-600">km</span>
              </div>
            </div>

            <div className="relative">
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={handleSliderChange}
                className="w-full h-3 bg-emerald-200 rounded-lg appearance-none cursor-pointer slider-emerald"
                style={{
                  background: `linear-gradient(to right, #059669 0%, #059669 ${((radius - 1) / 49) * 100}%, #d1fae5 ${((radius - 1) / 49) * 100}%, #d1fae5 100%)`
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>1 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGetLocation}
            className="w-full text-sm text-emerald-700 hover:text-emerald-800 font-medium py-2 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            🔄 Actualizar ubicación
          </button>
        </>
      )}
    </div>
  )
}
