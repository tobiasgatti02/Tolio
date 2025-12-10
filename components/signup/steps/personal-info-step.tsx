import { useState } from "react"
import { Loader2 } from 'lucide-react'
import type { SignupFormData } from "../signup-form"
import { PhoneInput } from "@/components/ui/phone-input"

interface PersonalInfoStepProps {
  formData: SignupFormData
  updateFormData: (data: Partial<SignupFormData>) => void
  onNext: () => void
  onBack: () => void
  isSubmitting: boolean
}

export default function PersonalInfoStep({ 
  formData, 
  updateFormData, 
  onNext, 
  onBack,
  isSubmitting
}: PersonalInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.firstName) {
      newErrors.firstName = "El nombre es obligatorio"
    }
    
    if (!formData.lastName) {
      newErrors.lastName = "El apellido es obligatorio"
    }
    
    if (!formData.phone) {
      newErrors.phone = "El teléfono es obligatorio"
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Debes aceptar los términos y condiciones"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext()
    }
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Información personal</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData({ firstName: e.target.value })}
              className={`block w-full rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.firstName ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Apellido
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData({ lastName: e.target.value })}
              className={`block w-full rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.lastName ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <PhoneInput
            value={formData.phone}
            onChange={(value) => updateFormData({ phone: value })}
            error={errors.phone}
            placeholder="11 1234 5678"
            defaultCountry="AR"
          />
        </div>
        
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de nacimiento
          </label>
          <input
            type="date"
            id="birthDate"
            value={formData.birthDate}
            onChange={(e) => updateFormData({ birthDate: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={(e) => updateFormData({ address: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Código postal
            </label>
            <input
              type="text"
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => updateFormData({ postalCode: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
        
        <div className="flex items-start mt-4">
          <div className="flex items-center h-5">
            <input
              id="agreeTerms"
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) => updateFormData({ agreeTerms: e.target.checked })}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agreeTerms" className="text-gray-700">
              Acepto los <a href="/terms" className="text-emerald-600 hover:text-emerald-500">Términos y Condiciones</a> y la <a href="/privacy" className="text-emerald-600 hover:text-emerald-500">Política de Privacidad</a>
            </label>
            {errors.agreeTerms && <p className="mt-1 text-sm text-red-600">{errors.agreeTerms}</p>}
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Atrás
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              "Continuar"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
