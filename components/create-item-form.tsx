"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X, Upload, Loader2 } from 'lucide-react'
import { PenTool,Car, Laptop, Camera, Music, Book, Tent, Utensils } from 'lucide-react'
import { getCategories } from "@/app/api/categorias/route"
  

interface FormData {
  title: string
  description: string
  category: string
  price: string
  deposit: string
  location: string
  features: string[]
}

export default function CreateItemForm() {
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
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      const newImages = [...images, ...selectedFiles].slice(0, 5) // Limit to 5 images
      setImages(newImages)

      // Create previews
      const newPreviews = newImages.map((file) => URL.createObjectURL(file))
      
      // Revoke old preview URLs to avoid memory leaks
      imagesPreviews.forEach((url) => URL.revokeObjectURL(url))
      
      setImagesPreviews(newPreviews)
      
      // Clear error when images are added
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: undefined }))
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)

    // Update previews
    URL.revokeObjectURL(imagesPreviews[index])
    const newPreviews = [...imagesPreviews]
    newPreviews.splice(index, 1)
    setImagesPreviews(newPreviews)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
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

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData & { images: string }> = {}

    if (!formData.title.trim()) newErrors.title = "El título es obligatorio"
    if (!formData.description.trim()) newErrors.description = "La descripción es obligatoria"
    if (!formData.category) newErrors.category = "La categoría es obligatoria"
    if (!formData.price.trim()) {
      newErrors.price = "El precio es obligatorio"
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = "El precio debe ser un número positivo"
    }
    if (!formData.deposit.trim()) {
      newErrors.deposit = "El depósito es obligatorio"
    } else if (isNaN(parseFloat(formData.deposit)) || parseFloat(formData.deposit) <= 0) {
      newErrors.deposit = "El depósito debe ser un número positivo"
    }
    if (!formData.location.trim()) newErrors.location = "La ubicación es obligatoria"
    if (images.length === 0) newErrors.images = "Debes subir al menos una imagen"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
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
  
      router.push("/dashboard?itemCreated=true")
    } catch (error) {
      console.error("Error creating item:", error)
      alert("Hubo un error al crear el artículo. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`block w-full rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
            errors.title ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Ej: Taladro profesional"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className={`block w-full rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
            errors.description ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Describe tu artículo en detalle"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Categoría <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`block w-full rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
            errors.category ? "border-red-300" : "border-gray-300"
          }`}
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>

      {/* Price and Deposit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Precio por día ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className={`block w-full rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.price ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="15.00"
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>
        <div>
          <label htmlFor="deposit" className="block text-sm font-medium text-gray-700 mb-1">
            Depósito de seguridad ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="deposit"
            name="deposit"
            min="0"
            step="0.01"
            value={formData.deposit}
            onChange={handleChange}
            className={`block w-full rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.deposit ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="50.00"
          />
          {errors.deposit && <p className="mt-1 text-sm text-red-600">{errors.deposit}</p>}
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Ubicación <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className={`block w-full rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
            errors.location ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Ej: Ciudad de México, CDMX"
        />
        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Características</label>
        <div className="flex">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            className="flex-grow rounded-l-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Ej: Inalámbrico"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addFeature()
              }
            }}
          />
          <button
            type="button"
            onClick={addFeature}
            className="bg-emerald-600 text-white px-4 py-2 rounded-r-md hover:bg-emerald-700"
          >
            Agregar
          </button>
        </div>
        {formData.features.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <div
                key={index}
                className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center"
              >
                <span>{feature}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(feature)}
                  className="ml-2 text-emerald-600 hover:text-emerald-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imágenes <span className="text-red-500">*</span> (máximo 5)
        </label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          multiple
          className="hidden"
        />
        <div
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 ${
            errors.images ? "border-red-300" : "border-gray-300"
          }`}
        >
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Haz clic para seleccionar imágenes</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP hasta 5MB</p>
        </div>
        {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}

        {imagesPreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {imagesPreviews.map((preview, index) => (
              <div key={index} className="relative">
                <div className="relative h-24 w-full rounded-md overflow-hidden">
                  <Image src={preview || "/placeholder.svg"} alt={`Preview ${index + 1}`} fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Publicando...
            </>
          ) : (
            "Publicar artículo"
          )}
        </button>
      </div>
    </form>
  )
}
