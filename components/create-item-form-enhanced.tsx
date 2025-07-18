"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  X, Upload, Loader2, Plus, Trash2, MapPin, DollarSign, 
  Camera, Sparkles, CheckCircle, AlertCircle, Info 
} from 'lucide-react'
import { 
  PenTool, Car, Laptop, Camera as CameraIcon, Music, 
  Book, Tent, Utensils, Monitor, Gamepad2, Home 
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

const categoryIcons: { [key: string]: any } = {
  "Electrónicos": Monitor,
  "Vehículos": Car,
  "Deportes": Gamepad2,
  "Hogar": Home,
  "Libros": Book,
  "Música": Music,
  "Cámara": CameraIcon,
  "Camping": Tent,
  "Cocina": Utensils,
  "Arte": PenTool,
  "Computadoras": Laptop,
}

export default function EnhancedCreateItemForm() {
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
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState("")
  const [errors, setErrors] = useState<Partial<FormData & { images: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    const newImages = [...images, ...imageFiles].slice(0, 8) // Limit to 8 images
    setImages(newImages)

    const newPreviews = newImages.map((file) => URL.createObjectURL(file))
    imagesPreviews.forEach((url) => URL.revokeObjectURL(url))
    setImagesPreviews(newPreviews)
    
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: undefined }))
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)

    URL.revokeObjectURL(imagesPreviews[index])
    const newPreviews = [...imagesPreviews]
    newPreviews.splice(index, 1)
    setImagesPreviews(newPreviews)
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature)
    }))
  }

  const validateStep = (step: number) => {
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
      if (!formData.price) newErrors.price = "El precio es requerido"
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
      const submitFormData = new FormData()
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'features') {
          submitFormData.append(key, JSON.stringify(value))
        } else {
          submitFormData.append(key, value)
        }
      })
      
      // Add images
      images.forEach((image) => {
        submitFormData.append('images', image)
      })
      
      const response = await fetch("/api/items", {
        method: "POST",
        body: submitFormData,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Error response:", response.status, errorData)
        throw new Error(`Error al crear el artículo: ${errorData.error || response.statusText}`)
      }
      
      router.push("/dashboard/my-items?success=true")
    } catch (error) {
      console.error("Error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al crear el artículo"
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-semibold
            ${currentStep >= step 
              ? 'bg-emerald-500 text-white' 
              : 'bg-gray-200 text-gray-500'
            }
          `}>
            {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 3 && (
            <div className={`
              w-16 h-1 mx-2
              ${currentStep > step ? 'bg-emerald-500' : 'bg-gray-200'}
            `} />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Información básica</h2>
        <p className="text-gray-600">Cuéntanos sobre tu objeto</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título del artículo *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
              errors.title ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder="Ej: iPhone 14 Pro Max 128GB"
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
            Categoría *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.name] || Monitor
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105
                    ${formData.category === category.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-emerald-300'
                    }
                  `}
                >
                  <IconComponent className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              )
            })}
          </div>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.category}
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
            rows={4}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors resize-none ${
              errors.description ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder="Describe tu artículo: estado, características especiales, etc."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Camera className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Agrega fotos</h2>
        <p className="text-gray-600">Las buenas fotos aumentan las posibilidades de alquiler</p>
      </div>

      <div 
        className={`
          border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300
          ${isDragging 
            ? 'border-emerald-400 bg-emerald-50' 
            : images.length > 0 
              ? 'border-gray-300 bg-gray-50' 
              : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100'
          }
          ${errors.images ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        
        {images.length === 0 ? (
          <div className="cursor-pointer">
            <Upload className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-700 mb-2">
              Arrastra tus fotos aquí
            </p>
            <p className="text-gray-500 mb-4">
              o haz clic para seleccionar archivos
            </p>
            <button
              type="button"
              className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Seleccionar fotos
            </button>
          </div>
        ) : (
          <div className="cursor-pointer">
            <Plus className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <p className="text-gray-600">Agregar más fotos</p>
          </div>
        )}
      </div>

      {errors.images && (
        <p className="text-red-500 text-sm flex items-center justify-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors.images}
        </p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {imagesPreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  width={200}
                  height={200}
                  className="object-cover w-full h-full"
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(index)
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Consejos para mejores fotos:</p>
            <ul className="space-y-1 text-blue-600">
              <li>• Usa buena iluminación natural</li>
              <li>• Muestra el objeto desde diferentes ángulos</li>
              <li>• Incluye detalles importantes</li>
              <li>• La primera foto será la principal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <DollarSign className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Precio y ubicación</h2>
        <p className="text-gray-600">Establece el precio y dónde se encuentra tu objeto</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio por día *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
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
            Depósito de seguridad
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              name="deposit"
              value={formData.deposit}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Opcional - Se devuelve al final del alquiler</p>
        </div>
      </div>

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
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Características especiales
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ej: Incluye cargador, Como nuevo, etc."
          />
          <button
            type="button"
            onClick={addFeature}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {formData.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <span
                key={index}
                className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(feature)}
                  className="ml-2 text-emerald-500 hover:text-emerald-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white">
        <h1 className="text-3xl font-bold text-center">Publica tu objeto</h1>
        <p className="text-center text-emerald-100 mt-2">Gana dinero alquilando tus objetos</p>
      </div>
      
      <div className="p-8">
        <StepIndicator />
        
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          
          <div className="flex justify-between pt-8 border-t border-gray-200 mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Anterior
              </button>
            )}
            
            <div className="ml-auto">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    'Publicar objeto'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
