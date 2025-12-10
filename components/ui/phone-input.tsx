"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Search } from "lucide-react"

// Lista de países con sus códigos y banderas
const countries = [
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷", format: "9 XX XXXX XXXX" },
  { code: "MX", name: "México", dialCode: "+52", flag: "🇲🇽", format: "XX XXXX XXXX" },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴", format: "XXX XXX XXXX" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱", format: "9 XXXX XXXX" },
  { code: "PE", name: "Perú", dialCode: "+51", flag: "🇵🇪", format: "XXX XXX XXX" },
  { code: "EC", name: "Ecuador", dialCode: "+593", flag: "🇪🇨", format: "XX XXX XXXX" },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: "🇻🇪", format: "XXX XXX XXXX" },
  { code: "UY", name: "Uruguay", dialCode: "+598", flag: "🇺🇾", format: "XX XXX XXX" },
  { code: "PY", name: "Paraguay", dialCode: "+595", flag: "🇵🇾", format: "XXX XXX XXX" },
  { code: "BO", name: "Bolivia", dialCode: "+591", flag: "🇧🇴", format: "X XXX XXXX" },
  { code: "BR", name: "Brasil", dialCode: "+55", flag: "🇧🇷", format: "XX XXXXX XXXX" },
  { code: "ES", name: "España", dialCode: "+34", flag: "🇪🇸", format: "XXX XXX XXX" },
  { code: "US", name: "Estados Unidos", dialCode: "+1", flag: "🇺🇸", format: "XXX XXX XXXX" },
]

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  className?: string
  defaultCountry?: string
}

export function PhoneInput({ 
  value, 
  onChange, 
  error, 
  placeholder = "Número de teléfono",
  className = "",
  defaultCountry = "AR"
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find(c => c.code === defaultCountry) || countries[0]
  )
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Extraer el número sin el código de país del valor
  const getPhoneNumber = () => {
    if (!value) return ""
    // Remover el código de país del valor
    const dialCode = selectedCountry.dialCode
    if (value.startsWith(dialCode)) {
      return value.slice(dialCode.length).trim()
    }
    // Si el valor no tiene código, devolverlo tal cual
    return value.replace(/^\+\d+\s*/, "").trim()
  }

  const [phoneNumber, setPhoneNumber] = useState(getPhoneNumber())

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Actualizar el valor completo cuando cambia el país o el número
  useEffect(() => {
    if (phoneNumber) {
      onChange(`${selectedCountry.dialCode} ${phoneNumber}`)
    } else {
      onChange("")
    }
  }, [selectedCountry, phoneNumber])

  // Filtrar países por búsqueda
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números, espacios y guiones
    const cleaned = e.target.value.replace(/[^\d\s\-]/g, "")
    setPhoneNumber(cleaned)
  }

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country)
    setIsOpen(false)
    setSearchQuery("")
    inputRef.current?.focus()
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`flex rounded-md shadow-sm border ${error ? 'border-red-300' : 'border-gray-300'} focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500`}>
        {/* Selector de país */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-r border-gray-300 rounded-l-md hover:bg-gray-100 transition-colors min-w-[100px]"
          >
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-gray-700">{selectedCountry.dialCode}</span>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown de países */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
              {/* Buscador */}
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar país..."
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Lista de países */}
              <div className="overflow-y-auto max-h-48">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-orange-50 transition-colors text-left ${
                        selectedCountry.code === country.code ? 'bg-orange-50' : ''
                      }`}
                    >
                      <span className="text-xl">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{country.name}</p>
                        <p className="text-xs text-gray-500">{country.dialCode}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-4 text-sm text-gray-500 text-center">No se encontraron países</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input del número */}
        <input
          ref={inputRef}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-r-md focus:outline-none bg-white"
        />
      </div>

      {/* Mensaje de error */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Ayuda de formato */}
      <p className="mt-1 text-xs text-gray-500">
        Formato: {selectedCountry.dialCode} {selectedCountry.format}
      </p>
    </div>
  )
}
