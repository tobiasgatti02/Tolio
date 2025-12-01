"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import dynamic from "next/dynamic"
import ImageCropper from "./image-cropper"
import { 
  X, Upload, Loader2, Plus, Trash2, MapPin, DollarSign, 
  Camera, Sparkles, CheckCircle, AlertCircle, Info, Package, ArrowLeft
} from 'lucide-react'
import { provincias, getCiudades } from '@/lib/argentina-locations'

// Importar MapLocationPicker dinámicamente para evitar problemas con SSR
const MapLocationPicker = dynamic(() => import("./map-location-picker"), { ssr: false })

interface ItemData {
  id: string
  title: string
  description: string
  category: string
  price: number
  deposit: number
  location: string
  latitude: number | null
  longitude: number | null
  features: string[]
  images: string[]
}

interface FormData {
  title: string
  description: string
  category: string
  price: string
  deposit: string
  location: string
  latitude: number | null
  longitude: number | null
  features: string[]
}

interface EditItemFormProps {
  item: ItemData
}

export default function EditItemForm({ item }: EditItemFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    title: item.title || "",
    description: item.description || "",
    category: item.category || "",
    price: item.price?.toString() || "",
    deposit: item.deposit?.toString() || "0",
    location: item.location || "",
    latitude: item.latitude,
    longitude: item.longitude,
    features: item.features || [],
  })
  const [showMap, setShowMap] = useState(item.latitude !== null && item.longitude !== null)

  // Parsear ubicación existente para extraer provincia y ciudad
  const parseLocation = (location: string) => {
    const parts = location.split(', ')
    if (parts.length >= 2) {
      return { ciudad: parts[0], provincia: parts[1] }
    }
    return { ciudad: '', provincia: '' }
  }
  const initialLocation = parseLocation(item.location || '')
  const [selectedProvincia, setSelectedProvincia] = useState(initialLocation.provincia)
  const [selectedCiudad, setSelectedCiudad] = useState(initialLocation.ciudad)
  const [ciudades, setCiudades] = useState<string[]>(initialLocation.provincia ? getCiudades(initialLocation.provincia) : [])

  // Imágenes existentes (URLs base64 o URLs)
  const [existingImages, setExistingImages] = useState<string[]>(item.images || [])
  // Nuevas imágenes a subir
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData & { images: string }>>({})
  const [imageErrors, setImageErrors] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categorias")
        if (!response.ok) {
          throw new Error("Failed to fetch categories")
        }
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    
    fetchCategories()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Tamaño máximo de imagen: 5MB
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      const newImageErrors: string[] = []
      const validFiles = filesArray.filter((file) => {
        const isValidType = allowedTypes.includes(file.type.toLowerCase())
        if (!isValidType) {
          newImageErrors.push(`"${file.name}": Formato no soportado. Solo se permiten JPG, PNG y WebP.`)
          return false
        }
        
        // Validar tamaño de imagen
        if (file.size > MAX_IMAGE_SIZE) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
          newImageErrors.push(`"${file.name}": Imagen demasiado grande (${sizeMB}MB). Máximo 5MB.`)
          return false
        }
        
        return true
      })
      
      // Guardar errores para mostrar en el paso 3
      if (newImageErrors.length > 0) {
        setImageErrors(prev => [...prev, ...newImageErrors])
      }

      if (validFiles.length === 0) {
        return
      }

      const totalImages = existingImages.length + newImages.length + validFiles.length
      if (totalImages > 6) {
        alert("Máximo 6 imágenes permitidas")
        return
      }

      validFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setCropImage(reader.result as string)
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    const file = new File([croppedBlob], `cropped-image-${Date.now()}.jpg`, { type: 'image/jpeg' })
    
    setNewImages((prev) => [...prev, file])
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setNewImagePreviews((prev) => [...prev, reader.result as string])
    }
    reader.readAsDataURL(file)
    
    setCropImage(null)
  }

  const handleCropCancel = () => {
    setCropImage(null)
  }

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData & { images: string }> = {}
    
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "El título es requerido"
      if (!formData.description.trim()) newErrors.description = "La descripción es requerida"
      if (formData.description.trim().length < 10) newErrors.description = "La descripción debe tener al menos 10 caracteres"
      if (!formData.category) newErrors.category = "La categoría es requerida"
    }
    
    if (step === 2) {
      if (existingImages.length === 0 && newImages.length === 0) {
        newErrors.images = "Agrega al menos una imagen"
      }
    }
    
    if (step === 3) {
      if (!formData.price.trim()) {
        newErrors.price = "El precio es requerido"
      } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        newErrors.price = "El precio debe ser un número positivo"
      }
      if (!formData.location.trim()) newErrors.location = "La ubicación es requerida"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(3)) return
    
    setIsSubmitting(true)
  
    try {
      const formDataObj = new FormData()
      formDataObj.append("title", formData.title)
      formDataObj.append("description", formData.description)
      formDataObj.append("category", formData.category)
      formDataObj.append("price", formData.price)
      formDataObj.append("deposit", formData.deposit || "0")
      formDataObj.append("location", formData.location)
      if (formData.latitude !== null && formData.longitude !== null) {
        formDataObj.append("latitude", formData.latitude.toString())
        formDataObj.append("longitude", formData.longitude.toString())
      }
      formDataObj.append("features", JSON.stringify(formData.features))
      formDataObj.append("existingImages", JSON.stringify(existingImages))
  
      newImages.forEach((image) => {
        formDataObj.append("images", image)
      })
  
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        body: formDataObj,
      })
  
      if (!response.ok) {
        let errorMessage = "Error al actualizar el artículo"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // Si no hay JSON en la respuesta, usar el status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }
  
      const updatedItem = await response.json()
      router.push(`/items/${updatedItem.id || item.id}`)
    } catch (error: any) {
      console.error("Error updating item:", error)
      alert(error.message || "Hubo un error al actualizar el artículo. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalImages = existingImages.length + newImages.length

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver</span>
        </button>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 -z-10" />
            <div 
              className="absolute top-5 left-5 h-1 bg-blue-600 -z-10 transition-all duration-300"
              style={{ width: `calc(${((currentStep - 1) / 2) * 100}% - 20px)` }}
            />
            
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? <CheckCircle className="h-6 w-6" /> : step}
                </div>
                <span className="text-sm text-gray-600 mt-2">
                  {step === 1 ? 'Información' : step === 2 ? 'Imágenes' : 'Detalles'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Editar Herramienta</h1>
            <p className="text-gray-600">Modifica los datos de tu publicación</p>
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Información de la Herramienta</h2>
                <p className="text-gray-600">Actualiza los datos básicos</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la Herramienta *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.title ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Ej: Taladro percutor Bosch profesional"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.description ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Describe tu herramienta, estado, accesorios incluidos..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.category ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.category}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Images */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Imágenes de tu herramienta</h2>
                <p className="text-gray-600">
                  Actualiza las fotos ({totalImages}/6)
                </p>
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Imágenes actuales</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {existingImages.map((preview, index) => (
                      <div key={`existing-${index}`} className="relative group aspect-square">
                        <Image
                          src={preview}
                          alt={`Imagen ${index + 1}`}
                          fill
                          className="object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {newImagePreviews.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Nuevas imágenes</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {newImagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group aspect-square">
                        <Image
                          src={preview}
                          alt={`Nueva imagen ${index + 1}`}
                          fill
                          className="object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <span className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Nueva
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add more images */}
              {totalImages < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video md:aspect-auto md:h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <Camera className="h-8 w-8 text-gray-400 group-hover:text-blue-500" />
                  <span className="text-sm text-gray-600 group-hover:text-blue-600">
                    Agregar más fotos ({6 - totalImages} disponibles)
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />

              {errors.images && (
                <p className="text-red-500 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.images}
                </p>
              )}

              <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900 mb-1">Consejos para buenas fotos:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Toma fotos desde varios ángulos</li>
                    <li>Muestra el estado general y detalles importantes</li>
                    <li>Incluye accesorios si vienen con la herramienta</li>
                    <li>Asegúrate de que las imágenes tengan buena iluminación</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing and Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Precio y Ubicación</h2>
                <p className="text-gray-600">Últimos detalles de tu herramienta</p>
              </div>

              {/* Pricing */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por Día *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.price ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Depósito de Seguridad (opcional)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Se devuelve al finalizar el préstamo si no hay daños. Déjalo en 0 si no lo requieres.
                  </p>
                </div>
              </div>

              {/* Location - Provincia y Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <select
                      value={selectedProvincia}
                      onChange={(e) => {
                        const provincia = e.target.value
                        setSelectedProvincia(provincia)
                        setSelectedCiudad("")
                        setCiudades(getCiudades(provincia))
                        setFormData(prev => ({ ...prev, location: "" }))
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.location && !selectedProvincia ? 'border-red-300' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Selecciona provincia</option>
                      {provincias.map((provincia) => (
                        <option key={provincia} value={provincia}>{provincia}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={selectedCiudad}
                      onChange={(e) => {
                        const ciudad = e.target.value
                        setSelectedCiudad(ciudad)
                        if (ciudad && selectedProvincia) {
                          setFormData(prev => ({ 
                            ...prev, 
                            location: `${ciudad}, ${selectedProvincia}` 
                          }))
                        }
                      }}
                      disabled={!selectedProvincia}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.location && !selectedCiudad ? 'border-red-300' : 'border-gray-200'
                      } ${!selectedProvincia ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Selecciona ciudad</option>
                      {ciudades.map((ciudad) => (
                        <option key={ciudad} value={ciudad}>{ciudad}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {formData.location && (
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {formData.location}
                  </p>
                )}
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Optional Map Location */}
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMap}
                    onChange={(e) => setShowMap(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    📍 Mostrar ubicación exacta en el mapa (opcional)
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Ayuda a los usuarios a encontrar tu herramienta más fácilmente
                </p>
                
                {showMap && (
                  <div className="mt-4">
                    <MapLocationPicker
                      onLocationSelect={(lat, lng) => {
                        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
                      }}
                      initialLat={formData.latitude || undefined}
                      initialLng={formData.longitude || undefined}
                      height="350px"
                    />
                  </div>
                )}
              </div>

              {/* Errores de imágenes */}
              {imageErrors.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800 mb-2">Problemas con las imágenes:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {imageErrors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => setImageErrors([])}
                        className="text-sm text-red-600 hover:text-red-800 mt-2 underline"
                      >
                        Limpiar errores
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Características y Accesorios
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Incluye maletín, Set de brocas, Cable 5m..."
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(feature)}
                          className="hover:text-blue-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>
            )}
            
            <div className="ml-auto flex gap-3">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Siguiente
                  <Sparkles className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Image Cropper Modal */}
        {cropImage && (
          <ImageCropper
            image={cropImage}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            aspect={4 / 3}
          />
        )}
      </div>
    </div>
  )
}