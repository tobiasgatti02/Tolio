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
  type: 'SERVICE' | 'TOOL'
  category: string
  price: string
  priceType: 'hour' | 'day'  // Nuevo campo para tipo de precio
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
    type: "SERVICE",
    category: "",
    price: "",
    priceType: "hour",
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
            w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
            ${currentStep >= step 
              ? 'bg-orange-500 text-white shadow-elegant' 
              : 'bg-muted text-muted-foreground'
            }
          `}>
            {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 3 && (
            <div className={`
              w-16 h-1 mx-2 transition-all
              ${currentStep > step ? 'bg-orange-500' : 'bg-border'}
            `} />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="w-12 h-12 text-orange-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Informacion basica</h2>
        <p className="text-gray-600">Cuentanos que queres publicar</p>
      </div>

      <div className="space-y-4">
        {/* Selector de tipo de publicación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Que queres publicar? *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'SERVICE' }))}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105
                ${formData.type === 'SERVICE'
                  ? 'border-orange-500 bg-orange-600 hover:bg-orange-700 text-white shadow-lg'
                  : 'border-gray-200 hover:border-orange-400'
                }
              `}
            >
              <PenTool className="w-8 h-8 mx-auto mb-2" />
              <span className="text-base font-semibold">Servicio/Oficio</span>
              <p className={`text-xs mt-1 ${formData.type === 'SERVICE' ? 'text-white/90' : 'text-gray-500'}`}>
                Plomería, electricidad, etc.
              </p>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'TOOL' }))}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105
                ${formData.type === 'TOOL'
                  ? 'border-blue-500 bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                  : 'border-gray-200 hover:border-blue-400'
                }
              `}
            >
              <Home className="w-8 h-8 mx-auto mb-2" />
              <span className="text-base font-semibold">Herramienta</span>
              <p className={`text-xs mt-1 ${formData.type === 'TOOL' ? 'text-white/90' : 'text-gray-500'}`}>
                Taladro, escalera, etc.
              </p>
            </button>
          </div>
          
          {/* Disclaimer para herramientas */}
          {formData.type === 'TOOL' && (
            <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Importante</p>
                  <p>Al publicar una herramienta, lo haces bajo tu propia responsabilidad. 
                  Tolio no se hace responsable por danos, perdidas o cualquier situacion que 
                  pueda ocurrir con la herramienta prestada.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
              errors.title ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder={formData.type === 'SERVICE' ? 'Ej: Plomero con 10 años de experiencia' : 'Ej: Taladro inalámbrico 20V'}
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
              const IconComponent = categoryIcons[category.nombre] || Monitor
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.nombre }))}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105
                    ${formData.category === category.nombre
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                      : 'border-gray-200 hover:border-orange-500/50'
                    }
                  `}
                >
                  <IconComponent className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">{category.nombre}</span>
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
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none ${
              errors.description ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder={formData.type === 'SERVICE' 
              ? 'Describe tu servicio: experiencia, especialidades, disponibilidad, etc.' 
              : 'Describe la herramienta: estado, características, accesorios incluidos, etc.'}
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
        <Camera className="w-12 h-12 text-orange-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 text-gray-900 mb-2">Agrega fotos</h2>
        <p className="text-gray-600 text-gray-600">
          {formData.type === 'SERVICE' 
            ? 'Mostrá tu trabajo o espacio de trabajo' 
            : 'Las buenas fotos aumentan el interés'}
        </p>
      </div>

      <div 
        className={`
          border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300
          ${isDragging 
            ? 'border-orange-500 bg-orange-500/10' 
            : images.length > 0 
              ? 'border-border bg-muted' 
              : 'border-orange-500/50 bg-orange-500/5 hover:bg-orange-500/10'
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
            <Upload className="w-16 h-16 text-orange-600 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-700 text-gray-900 mb-2">
              Arrastra tus fotos aquí
            </p>
            <p className="text-gray-500 text-gray-600 mb-4">
              o haz clic para seleccionar archivos
            </p>
            <button
              type="button"
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg hover:shadow-xl transition-all"
            >
              Seleccionar fotos
            </button>
          </div>
        ) : (
          <div className="cursor-pointer">
            <Plus className="w-12 h-12 text-orange-600 mx-auto mb-2" />
            <p className="text-gray-600 text-gray-600">Agregar más fotos</p>
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
              <div className="aspect-square rounded-xl overflow-hidden bg-muted">
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
                className="absolute -top-2 -right-2 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-secondary">
            <p className="font-medium mb-1">Consejos para mejores fotos:</p>
            <ul className="space-y-1 opacity-90">
              <li>• Usa buena iluminación natural</li>
              <li>• Muestra {formData.type === 'SERVICE' ? 'tu trabajo' : 'el objeto'} desde diferentes ángulos</li>
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
        <MapPin className="w-12 h-12 text-orange-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ubicación y detalles</h2>
        <p className="text-gray-600">Completá los últimos detalles de tu publicación</p>
      </div>

      {/* Campos de precio */}
      <div className="space-y-6">
        {formData.type === 'SERVICE' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio por hora *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
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
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de precio *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priceType"
                    value="hour"
                    checked={formData.priceType === 'hour'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Por hora
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priceType"
                    value="day"
                    checked={formData.priceType === 'day'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Por día
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio por {formData.priceType === 'hour' ? 'hora' : 'día'} *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
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
          </div>
        )}

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
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
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
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
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
            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={formData.type === 'SERVICE' ? 'Ej: Disponibilidad fines de semana, Trabajo en equipo' : 'Ej: Incluye cargador, Como nuevo, etc.'}
          />
          <button
            type="button"
            onClick={addFeature}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {formData.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <span
                key={index}
                className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(feature)}
                  className="ml-2 text-orange-600 hover:text-orange-600/70"
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
      <div className="bg-orange-600 p-8 text-white">
        <h1 className="text-3xl font-bold text-center">
          {formData.type === 'SERVICE' ? 'Publica tu Servicio' : 'Publica tu Herramienta'}
        </h1>
        <p className="text-center text-white/90 mt-2">
          {formData.type === 'SERVICE' 
            ? 'Conecta con personas que necesitan tus habilidades' 
            : 'Comparte tus herramientas con tu comunidad'}
        </p>
      </div>
      
      <div className="p-8">
        <StepIndicator />
        
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          
          <div className="flex justify-between pt-8 border-t border-border mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border-2 border-border text-foreground rounded-xl hover:bg-muted transition-all font-medium"
              >
                Anterior
              </button>
            )}
            
            <div className="ml-auto">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors font-medium"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    `Publicar ${formData.type === 'SERVICE' ? 'Servicio' : 'Herramienta'}`
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
