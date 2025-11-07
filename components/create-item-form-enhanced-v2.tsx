"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import ImageCropper from "./image-cropper"
import { 
  X, Upload, Loader2, Plus, Trash2, MapPin, DollarSign, 
  Camera, Sparkles, CheckCircle, AlertCircle, Info, Package
} from 'lucide-react'

interface FormData {
  title: string
  description: string
  category: string
  price: string
  deposit: string
  location: string
  features: string[]
}

export default function CreateItemFormEnhanced() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    price: "",
    deposit: "",
    location: "",
    features: [],
  })

  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData & { images: string }>>({})
  const [newFeature, setNewFeature] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null)
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      const validFiles = filesArray.filter((file) => {
        const isValidType = allowedTypes.includes(file.type.toLowerCase())
        if (!isValidType) {
          alert(`Formato no soportado: ${file.name}. Solo se permiten JPG, PNG y WebP.`)
        }
        return isValidType
      })

      if (validFiles.length === 0) {
        return
      }

      if (images.length + validFiles.length > 6) {
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
    
    setImages((prev) => [...prev, file])
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreviews((prev) => [...prev, reader.result as string])
    }
    reader.readAsDataURL(file)
    
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
      if (!formData.category) newErrors.category = "La categoría es requerida"
    }
    
    if (step === 2) {
      if (images.length === 0) newErrors.images = "Agrega al menos una imagen"
    }
    
    if (step === 3) {
      if (!formData.price.trim()) {
        newErrors.price = "El precio es requerido"
      } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        newErrors.price = "El precio debe ser un número positivo"
      }
      if (!formData.deposit.trim()) {
        newErrors.deposit = "El depósito es requerido"
      } else if (isNaN(parseFloat(formData.deposit)) || parseFloat(formData.deposit) < 0) {
        newErrors.deposit = "El depósito debe ser un número positivo o cero"
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
      formDataObj.append("deposit", formData.deposit)
      formDataObj.append("location", formData.location)
      formDataObj.append("features", JSON.stringify(formData.features))
  
      images.forEach((image) => {
        formDataObj.append("images", image)
      })
  
      const response = await fetch('/api/items', {
        method: 'POST',
        body: formDataObj,
      })
  
      if (!response.ok) {
        throw new Error("Error creating item")
      }
  
      const newItem = await response.json()
      router.push(`/items/${newItem.id}`)
    } catch (error) {
      console.error("Error creating item:", error)
      alert("Hubo un error al crear el artículo. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? <CheckCircle className="h-6 w-6" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-24 h-1 mx-2 transition-all ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Información</span>
            <span>Imágenes</span>
            <span>Detalles</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Información de la Herramienta</h2>
                <p className="text-gray-600">Contános qué herramienta estás prestando</p>
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

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-gray-900 mb-1">Consejos para un buen título</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Incluye la marca y modelo si es conocido</li>
                      <li>Menciona si es profesional o semi-profesional</li>
                      <li>Sé específico sobre el tipo de herramienta</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Images */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Agrega fotos de tu herramienta</h2>
                <p className="text-gray-600">
                  Muestra el estado y detalles de tu herramienta
                </p>
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
                      Agregar foto
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Precio y Ubicación</h2>
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
                    Depósito de Seguridad *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.deposit ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.deposit && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.deposit}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Se devuelve al finalizar el préstamo si no hay daños
                  </p>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.location ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Ej: Palermo, CABA"
                  />
                </div>
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.location}
                  </p>
                )}
              </div>

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
                      Publicando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Publicar Herramienta
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
