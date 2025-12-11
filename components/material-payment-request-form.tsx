"use client"

import { useState } from 'react'
import { Plus, X, DollarSign, Loader2, Package } from 'lucide-react'

interface Material {
  name: string
  price: number
}

interface MaterialPaymentRequestFormProps {
  bookingId: string
  onSubmit: (materials: Material[]) => Promise<void>
  onCancel: () => void
}

export default function MaterialPaymentRequestForm({
  bookingId,
  onSubmit,
  onCancel,
}: MaterialPaymentRequestFormProps) {
  const [materials, setMaterials] = useState<Material[]>([{ name: '', price: 0 }])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<number, string>>({})

  const addMaterial = () => {
    setMaterials([...materials, { name: '', price: 0 }])
  }

  const removeMaterial = (index: number) => {
    if (materials.length > 1) {
      setMaterials(materials.filter((_, i) => i !== index))
      const newErrors = { ...errors }
      delete newErrors[index]
      setErrors(newErrors)
    }
  }

  const updateMaterial = (index: number, field: 'name' | 'price', value: string | number) => {
    const newMaterials = [...materials]
    newMaterials[index] = { ...newMaterials[index], [field]: value }
    setMaterials(newMaterials)
    
    // Clear error for this field
    if (errors[index]) {
      const newErrors = { ...errors }
      delete newErrors[index]
      setErrors(newErrors)
    }
  }

  const validateMaterials = (): boolean => {
    const newErrors: Record<number, string> = {}
    
    materials.forEach((material, index) => {
      if (!material.name.trim()) {
        newErrors[index] = 'El nombre del material es requerido'
      } else if (material.price <= 0) {
        newErrors[index] = 'El precio debe ser mayor a 0'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateMaterials()) {
      return
    }

    setLoading(true)
    try {
      await onSubmit(materials)
    } catch (error) {
      console.error('Error submitting materials:', error)
      alert('Error al solicitar pago de materiales. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = materials.reduce((sum, m) => sum + (m.price || 0), 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Solicitar Pago de Materiales</h2>
              <p className="text-orange-100 text-sm">Detalla los materiales necesarios</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {materials.map((material, index) => (
              <div
                key={index}
                className={`border-2 rounded-xl p-4 ${
                  errors[index] ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material {index + 1}
                      </label>
                      <input
                        type="text"
                        value={material.name}
                        onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                        placeholder="Ej: Cemento, Pintura, Cables..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="number"
                          value={material.price || ''}
                          onChange={(e) => updateMaterial(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    {errors[index] && (
                      <p className="text-red-600 text-sm">{errors[index]}</p>
                    )}
                  </div>
                  {materials.length > 1 && (
                    <button
                      onClick={() => removeMaterial(index)}
                      className="mt-8 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addMaterial}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Plus className="h-5 w-5" />
              Agregar otro material
            </button>
          </div>

          {/* Total */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Total a solicitar:</span>
              <span className="text-2xl font-bold text-orange-600">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              ℹ️ El cliente recibirá una notificación y podrá pagar los materiales antes de que comiences el trabajo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 border-t flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || totalAmount === 0}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                Solicitar Pago
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
