"use client"

import { useState } from "react"
import { X, Plus, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface MaterialItem {
  name: string
  price: number
}

interface MaterialRequestModalProps {
  isOpen: boolean
  onClose: () => void
  userRole: 'provider' | 'client'
  existingMaterials?: MaterialItem[]
  existingTotal?: number
  onSubmit: (materials: MaterialItem[]) => Promise<void>
  onApprove?: () => Promise<void>
  onReject?: () => Promise<void>
}

export default function MaterialRequestModal({
  isOpen,
  onClose,
  userRole,
  existingMaterials = [],
  existingTotal = 0,
  onSubmit,
  onApprove,
  onReject
}: MaterialRequestModalProps) {
  const [materials, setMaterials] = useState<MaterialItem[]>(
    existingMaterials.length > 0 ? existingMaterials : [{ name: '', price: 0 }]
  )
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const addMaterial = () => {
    setMaterials([...materials, { name: '', price: 0 }])
  }

  const removeMaterial = (index: number) => {
    if (materials.length > 1) {
      setMaterials(materials.filter((_, i) => i !== index))
    }
  }

  const updateMaterial = (index: number, field: 'name' | 'price', value: string | number) => {
    const updated = [...materials]
    if (field === 'name') {
      updated[index].name = value as string
    } else {
      updated[index].price = Number(value)
    }
    setMaterials(updated)
  }

  const calculateTotal = () => {
    if (existingMaterials.length > 0) {
      return existingTotal
    }
    return materials.reduce((sum, item) => sum + (item.price || 0), 0)
  }

  const handleSubmit = async () => {
    // Validate
    const validMaterials = materials.filter(m => m.name.trim() && m.price > 0)
    if (validMaterials.length === 0) {
      alert('Por favor agrega al menos un material con nombre y monto')
      return
    }

    setIsLoading(true)
    try {
      await onSubmit(validMaterials)
      onClose()
    } catch (error) {
      console.error('Error submitting materials:', error)
      alert('Error al enviar la solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!onApprove) return
    setIsLoading(true)
    try {
      await onApprove()
      onClose()
    } catch (error) {
      console.error('Error approving materials:', error)
      alert('Error al aprobar la solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!onReject) return
    setIsLoading(true)
    try {
      await onReject()
      onClose()
    } catch (error) {
      console.error('Error rejecting materials:', error)
      alert('Error al rechazar la solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  const total = calculateTotal()
  const isReadOnly = existingMaterials.length > 0

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-tolio-gray-900">
            {userRole === 'provider' ? 'Solicitar Materiales' : 'Aprobar Materiales'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            {userRole === 'provider'
              ? 'Especifica los materiales necesarios y sus costos. El cliente pagará estos montos directamente para la compra de materiales.'
              : 'Al aprobar, se procesará el pago de los materiales listados a continuación.'}
          </p>

          {!isReadOnly ? (
            // Provider view - editable form
            <div className="space-y-3">
              {materials.map((material, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Nombre del material"
                      value={material.name}
                      onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tolio-orange-500"
                      disabled={isLoading}
                    />
                    <input
                      type="number"
                      placeholder="Monto"
                      value={material.price || ''}
                      onChange={(e) => updateMaterial(index, 'price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tolio-orange-500"
                      min="0"
                      step="0.01"
                      disabled={isLoading}
                    />
                  </div>
                  {materials.length > 1 && (
                    <button
                      onClick={() => removeMaterial(index)}
                      className="p-2 text-status-red hover:bg-status-red-bg rounded-lg mt-1"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addMaterial}
                className="w-full border-tolio-orange-500 text-tolio-orange-500 hover:bg-tolio-orange-50"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Material
              </Button>
            </div>
          ) : (
            // Client view - read-only list
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 mb-3">
                {existingMaterials.map((material, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{material.name}</span>
                    <span className="font-semibold text-tolio-gray-900">
                      ${material.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-tolio-gray-900">Total:</span>
              <span className="text-2xl font-bold text-tolio-orange-500">
                ${total.toLocaleString()}
              </span>
            </div>
            <div className="bg-tolio-orange-50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-tolio-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-tolio-orange-800">
                {userRole === 'provider'
                  ? 'Este monto será solicitado al cliente para la compra de materiales. No incluye comisión de plataforma.'
                  : 'Este pago va 100% al proveedor para comprar los materiales. No se cobra comisión de plataforma por materiales.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {userRole === 'provider' ? (
            <>
              <Button
                className="flex-1 bg-tolio-orange-500 hover:bg-tolio-orange-600 text-white h-11 font-semibold"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="h-11"
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button
                className="flex-1 bg-tolio-orange-500 hover:bg-tolio-orange-600 text-white h-11 font-semibold"
                onClick={handleApprove}
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : 'Confirmar Pago'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReject} 
                className="h-11 border-status-red text-status-red hover:bg-status-red-bg"
                disabled={isLoading}
              >
                Rechazar
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
