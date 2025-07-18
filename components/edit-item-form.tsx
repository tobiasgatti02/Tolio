"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X, Upload, Loader2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface ItemData {
  id: string
  title: string
  description: string
  category: { name: string }
  price: number
  deposit: number
  location: string
  features: string[]
  images: string[]
  ownerId: string
}

interface FormData {
  title: string
  description: string
  category: string
  price: string
  deposit: string
  location: string
  features: string[]
}

interface EditItemFormProps {
  item: ItemData
}

export default function EditItemForm({ item }: EditItemFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    title: item.title,
    description: item.description,
    category: item.category?.name || "",
    price: item.price.toString(),
    deposit: item.deposit.toString(),
    location: item.location,
    features: item.features || [],
  })
  
  // For new images to upload
  const [images, setImages] = useState<File[]>([])
  
  // For existing and new image previews
  const [imagesPreviews, setImagesPreviews] = useState<string[]>(item.images || [])
  
  // Keep track of removed images
  const [removedImages, setRemovedImages] = useState<string[]>([])
  
  const [newFeature, setNewFeature] = useState("")
  const [errors, setErrors] = useState<Partial<FormData & { images: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<any[]>([])
  const { toast } = useToast()
  
  // Fetch categories
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
      const totalImages = imagesPreviews.length - removedImages.length + selectedFiles.length
      
      if (totalImages > 5) {
        setErrors(prev => ({ ...prev, images: "No puedes subir más de 5 imágenes" }))
        return
      }
      
      const newImages = [...images, ...selectedFiles]
      setImages(newImages)

      // Create previews for new images
      const newPreviews = newImages.map((file) => URL.createObjectURL(file))
      
      // Combine with existing images that haven't been removed
      const existingImages = item.images.filter(img => !removedImages.includes(img))
      setImagesPreviews([...existingImages, ...newPreviews])
      
      // Clear error when images are added
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: undefined }))
      }
    }
  }

  const removeImage = (index: number) => {
    if (index < item.images.length) {
      // This is an existing image
      const imageUrl = item.images[index]
      setRemovedImages(prev => [...prev, imageUrl])
      
      const newPreviews = [...imagesPreviews]
      newPreviews.splice(index, 1)
      setImagesPreviews(newPreviews)
    } else {
      // This is a newly added image
      const newImageIndex = index - item.images.length
      const newImages = [...images]
      
      // Revoke URL to prevent memory leaks
      URL.revokeObjectURL(imagesPreviews[index])
      
      newImages.splice(newImageIndex, 1)
      setImages(newImages)
      
      const newPreviews = [...imagesPreviews]
      newPreviews.splice(index, 1)
      setImagesPreviews(newPreviews)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
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

  const validateForm = () => {
    const newErrors: Partial<FormData & { images: string }> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = "El título es obligatorio"
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria"
    }
    
    if (!formData.category) {
      newErrors.category = "La categoría es obligatoria"
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = "El precio debe ser mayor a 0"
    }
    
    if (!formData.deposit || isNaN(parseFloat(formData.deposit)) || parseFloat(formData.deposit) < 0) {
      newErrors.deposit = "El depósito debe ser 0 o mayor"
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "La ubicación es obligatoria"
    }
    
    const totalImages = imagesPreviews.length
    if (totalImages === 0) {
      newErrors.images = "Debes subir al menos una imagen"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Create FormData object to send files
      const formDataObj = new FormData()
      formDataObj.append("id", item.id)
      formDataObj.append("title", formData.title)
      formDataObj.append("description", formData.description)
      formDataObj.append("category", formData.category)
      formDataObj.append("price", formData.price)
      formDataObj.append("deposit", formData.deposit)
      formDataObj.append("location", formData.location)
      formDataObj.append("features", JSON.stringify(formData.features))
      formDataObj.append("removedImages", JSON.stringify(removedImages))
  
      // Add new images
      images.forEach((image, index) => {
        formDataObj.append("images", image)
      })
  
      const response = await fetch(`/api/items`, {
        method: 'PUT',
        body: formDataObj,
      })
  
      if (!response.ok) {
        throw new Error("Error updating item")
      }
  
      toast({
        title: "Artículo actualizado",
        description: "Tu artículo ha sido actualizado correctamente",
      })
      
      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating item:", error)
      toast({
        title: "Error",
        description: "Hubo un error al actualizar el artículo. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
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
          placeholder="Taladro inalámbrico"
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
          placeholder="Describe el artículo en detalle..."
        ></textarea>
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
          placeholder="Ciudad, Barrio o Zona"
        />
        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Características
        </label>
        <div className="flex">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
            className="flex-grow rounded-l-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Ej: En buen estado"
          />
          <button
            type="button"
            onClick={addFeature}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-r-md"
          >
            Agregar
          </button>
        </div>
        {formData.features.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm"
              >
                {feature}
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
                  <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-6 py-2 rounded-lg font-medium flex items-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Actualizando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </button>
      </div>
    </form>
  )
}