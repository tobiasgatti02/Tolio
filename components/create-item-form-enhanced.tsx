"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  Upload, X, MapPin, DollarSign, Package, 
  FileText, Tag, Loader2, CheckCircle, AlertCircle,
  Image as ImageIcon, Plus, Minus
} from "lucide-react"
import Image from "next/image"

// Categorías estáticas
const CATEGORIES = [
  { slug: "plomeria", name: "Plomería", icon: "🔧" },
  { slug: "electricidad", name: "Electricidad", icon: "⚡" },
  { slug: "pintura", name: "Pintura", icon: "🎨" },
  { slug: "carpinteria", name: "Carpintería", icon: "🪚" },
  { slug: "jardineria", name: "Jardinería", icon: "🌿" },
  { slug: "limpieza", name: "Limpieza", icon: "🧹" },
  { slug: "construccion", name: "Construcción", icon: "🏗️" },
  { slug: "herramientas", name: "Herramientas", icon: "🔨" },
  { slug: "electrodomesticos", name: "Electrodomésticos", icon: "📺" },
  { slug: "otros", name: "Otros", icon: "📦" }
]

export default function EnhancedCreateItemForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    priceType: "day",
    deposit: "",
    location: "",
    features: [""]
  })

  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData(prev => ({ ...prev, features: newFeatures }))
  }

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ""] }))
  }

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, features: newFeatures }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validar formatos
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError(`Formato no soportado: ${file.name}. Solo JPG, PNG y WebP`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`Imagen demasiado grande: ${file.name}. Máximo 10MB`)
        return false
      }
      return true
    })

    if (validFiles.length + images.length > 5) {
      setError("Máximo 5 imágenes permitidas")
      return
    }

    setImages(prev => [...prev, ...validFiles])

    // Crear previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("El título es obligatorio")
      return false
    }
    if (formData.description.trim().length < 10) {
      setError("La descripción debe tener al menos 10 caracteres")
      return false
    }
    if (!formData.category) {
      setError("Selecciona una categoría")
      return false
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("El precio debe ser mayor a 0")
      return false
    }
    if (!formData.location.trim()) {
      setError("La ubicación es obligatoria")
      return false
    }
    if (images.length === 0) {
      setError("Agrega al menos una imagen")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title.trim())
      formDataToSend.append('description', formData.description.trim())
      formDataToSend.append('category', formData.category)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('priceType', formData.priceType)
      formDataToSend.append('deposit', formData.deposit || '0')
      formDataToSend.append('location', formData.location.trim())
      formDataToSend.append('features', JSON.stringify(formData.features.filter(f => f.trim())))

      images.forEach(image => {
        formDataToSend.append('images', image)
      })

      const response = await fetch('/api/items', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el item')
      }

      setSuccessMessage("¡Item publicado exitosamente!")
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  // Mensaje de éxito
  if (successMessage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            ¡Publicado!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu item ha sido publicado exitosamente
          </p>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirigiendo al dashboard...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Publicar Artículo</h1>
            <p className="text-emerald-100">Comparte y gana dinero con lo que no usas</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Mensajes de error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Sección de Imágenes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Fotos del artículo *</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 group">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {images.length < 5 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                <span className="text-sm font-medium text-gray-600 group-hover:text-emerald-600">
                  {images.length === 0 ? "Subir fotos" : "Agregar más"}
                </span>
                <span className="text-xs text-gray-400">
                  {5 - images.length} restantes
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <p className="text-sm text-gray-500">
            Formatos: JPG, PNG, WebP • Máximo 5 fotos • Hasta 10MB cada una
          </p>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Información Básica */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Título del artículo *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej: Taladro eléctrico Bosch profesional"
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe tu artículo: estado, características, cómo se usa..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categoría *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none bg-white"
                required
              >
                <option value="">Selecciona una categoría</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ubicación *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ej: Palermo, CABA"
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Precios */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-600" />
            Precio de alquiler
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Precio *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-500 font-medium">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Por
              </label>
              <select
                name="priceType"
                value={formData.priceType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none bg-white"
              >
                <option value="day">Día</option>
                <option value="hour">Hora</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Depósito (opcional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-500 font-medium">$</span>
                <input
                  type="number"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Características */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">
            Características (opcional)
          </h3>

          <div className="space-y-3">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder="Ej: Batería incluida, Estuche de transporte"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="w-12 h-12 border-2 border-red-300 hover:bg-red-50 text-red-600 rounded-xl transition-all flex items-center justify-center"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}

            {formData.features.length < 10 && (
              <button
                type="button"
                onClick={addFeature}
                className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Agregar característica
              </button>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-4 px-6 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-all"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Publicar Artículo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
