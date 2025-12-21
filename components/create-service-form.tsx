"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import dynamic from "next/dynamic"
import ImageCropper from "./image-cropper"
import { 
  X, Upload, Loader2, Plus, Trash2, MapPin, DollarSign, 
  Camera, Sparkles, CheckCircle, AlertCircle, Info, Award, Map
} from 'lucide-react'
import { useTranslations } from 'next-intl';
import { provincias, getCiudades } from '@/lib/argentina-locations'

// Importar MapLocationPicker dinámicamente para evitar problemas con SSR
const MapLocationPicker = dynamic(() => import("./map-location-picker"), { ssr: false })

interface FormData {
  title: string
  description: string
  category: string
  pricePerHour: string
  priceType: 'hour' | 'custom'
  isProfessional: boolean
  mayIncludeMaterials: boolean
  location: string
  latitude: number | null
  longitude: number | null
  serviceArea: string
  features: string[]
}

const categories = [
  'Plomería',
  'Electricidad',
  'Construcción',
  'Pintura',
  'Jardinería',
  'Limpieza',
  'Mudanzas',
  'Tecnología',
  'Carpintería',
  'Cerrajería',
  'Aire Acondicionado',
  'Gasista',
  'Mecánica',
  'Herrería',
  'Albañilería',
  'Otros',
]

export default function CreateServiceForm() {
  const router = useRouter()
  const t = useTranslations('common');
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    pricePerHour: "",
    priceType: "hour",
    isProfessional: false,
    mayIncludeMaterials: false,
    location: "",
    latitude: null,
    longitude: null,
    serviceArea: "",
    features: [],
  })
  const [showMap, setShowMap] = useState(false)
  const [selectedProvincia, setSelectedProvincia] = useState("")
  const [selectedCiudad, setSelectedCiudad] = useState("")
  const [ciudades, setCiudades] = useState<string[]>([])

  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData & { images: string }>>({})
  const [imageErrors, setImageErrors] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (type === 'radio') {
      setFormData((prev) => ({ ...prev, [name]: value }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Tamaño máximo de imagen: 10MB
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      
      // Filtrar solo formatos soportados: JPG, JPEG, PNG, WebP
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
          newImageErrors.push(`"${file.name}": Imagen demasiado grande (${sizeMB}MB). Máximo 10MB. Comprimí la imagen o elegí otra.`)
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

      if (images.length + validFiles.length > 6) {
        alert("Máximo 6 imágenes permitidas")
        return
      }

      // Abrir cropper para cada imagen
      validFiles.forEach((file, index) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setCropImage(reader.result as string)
          setCurrentImageIndex(images.length + index)
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Convertir blob a File
    const file = new File([croppedBlob], `cropped-image-${Date.now()}.jpg`, { type: 'image/jpeg' })
    
    setImages((prev) => [...prev, file])
    
    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreviews((prev) => [...prev, reader.result as string])
    }
    reader.readAsDataURL(file)
    
    // Cerrar cropper
    setCropImage(null)
    setCurrentImageIndex(null)
  }

  const handleCropCancel = () => {
    setCropImage(null)
    setCurrentImageIndex(null)
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
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
      if (images.length === 0) newErrors.images = "Agrega al menos una imagen"
    }
    
    if (step === 3) {
      if (formData.priceType === 'hour' && (!formData.pricePerHour || parseFloat(formData.pricePerHour) <= 0)) {
        newErrors.pricePerHour = "El precio por hora es requerido"
      }
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
      const submitFormData = new FormData()
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'features') {
          submitFormData.append(key, JSON.stringify(value))
        } else if (key === 'isProfessional' || key === 'mayIncludeMaterials') {
          submitFormData.append(key, String(value))
        } else if (key === 'latitude' || key === 'longitude') {
          if (value !== null) {
            submitFormData.append(key, String(value))
          }
        } else {
          submitFormData.append(key, value as string)
        }
      })
      
      // Add images
      images.forEach((image) => {
        submitFormData.append('images', image)
      })
      
      const response = await fetch("/api/services", {
        method: "POST",
        body: submitFormData,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Error al crear el servicio: ${errorData.error || response.statusText}`)
      }
      
      const newService = await response.json()
      router.push(`/services/${newService.id}`)
    } catch (err) {
      console.error("Error:", err)
      alert(err instanceof Error ? err.message : "Error al crear el servicio")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Línea de fondo que conecta todos los pasos */}
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
                  {step === 1 ? t('form.step.info') : step === 2 ? t('form.step.images') : t('form.step.details')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('form.service.formTitle')}</h2>
                <p className="text-gray-600">{t('form.service.formDesc')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.service.titleLabel')}
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.title ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder={t('form.service.titlePlaceholder')}
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
                  {t('form.service.descLabel')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.description ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder={t('form.service.descPlaceholder')}
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
                  {t('form.service.categoryLabel')}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.category ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">{t('form.service.categoryOption')}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Professional Badge */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    name="isProfessional"
                    checked={formData.isProfessional}
                    onChange={handleChange}
                    className="mt-1 mr-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">{t('form.service.professional')}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('form.service.professionalDesc')}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Images */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('form.service.addPhotos')}</h2>
                <p className="text-gray-600">{t('form.service.examples')}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {images.length < 6 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <Camera className="h-8 w-8 text-gray-400 group-hover:text-blue-500" />
                    <span className="text-sm text-gray-600 group-hover:text-blue-600">
                      {t('form.service.addPhoto')}
                    </span>
                  </button>
                )}
              </div>

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

              {/* Errores de imágenes - mostrar en el paso de imágenes */}
              {imageErrors.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800 mb-2">⚠️ Problemas con las imágenes:</p>
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

              <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900 mb-1">{t('form.service.tips')}</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>{t('form.service.tip1')}</li>
                    <li>{t('form.service.tip2')}</li>
                    <li>{t('form.service.tip3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing and Location */}
          {currentStep === 3 && (
            <div className={`space-y-6 ${isSubmitting ? 'opacity-60 pointer-events-none' : ''}`}>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('form.service.priceLocation')}</h2>
                <p className="text-gray-600">{t('form.service.lastDetail')}</p>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('form.service.priceType')}
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center px-4 py-3 border-2 rounded-xl cursor-pointer flex-1 hover:border-blue-500 transition-colors">
                      <input
                        type="radio"
                        name="priceType"
                        value="hour"
                        checked={formData.priceType === 'hour'}
                        onChange={handleChange}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      <div>
                        <span className="font-medium">{t('form.service.price.hour')}</span>
                        <p className="text-sm text-gray-500">{t('form.service.price.hourDesc')}</p>
                      </div>
                    </label>
                    <label className="flex items-center px-4 py-3 border-2 rounded-xl cursor-pointer flex-1 hover:border-blue-500 transition-colors">
                      <input
                        type="radio"
                        name="priceType"
                        value="custom"
                        checked={formData.priceType === 'custom'}
                        onChange={handleChange}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      <div>
                        <span className="font-medium">{t('form.service.price.custom')}</span>
                        <p className="text-sm text-gray-500">{t('form.service.price.customDesc')}</p>
                      </div>
                    </label>
                  </div>
                </div>

                {formData.priceType === 'hour' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('form.service.pricePerHour')}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        name="pricePerHour"
                        value={formData.pricePerHour}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          errors.pricePerHour ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {errors.pricePerHour && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.pricePerHour}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Location - Provincia y Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.service.locationLabel')}
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
                  Ayuda a los clientes a encontrarte más fácilmente
                </p>
                
                {showMap && (
                  <div className="mt-4 relative z-0">
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

              {/* Service Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.service.serviceAreaLabel')}
                </label>
                <input
                  type="text"
                  name="serviceArea"
                  value={formData.serviceArea}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder={t('form.service.serviceAreaPlaceholder')}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t('form.service.optional')}
                </p>
              </div>

              {/* May Include Materials */}
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    name="mayIncludeMaterials"
                    checked={formData.mayIncludeMaterials}
                    onChange={handleChange}
                    className="mt-1 mr-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Este servicio puede requerir materiales adicionales</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Podrás solicitar el pago anticipado de materiales antes de comenzar el trabajo
                    </p>
                  </div>
                </label>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.service.features')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('form.service.featuresExample')}
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
                {t('form.service.prev')}
              </button>
            )}
            
            <div className="ml-auto flex gap-3">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {t('form.service.next')}
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
                      {t('form.service.publishing')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      {t('form.service.submit')}
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
