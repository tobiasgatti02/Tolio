"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from 'lucide-react'
import AccountStep from "./steps/account-step"
import PersonalInfoStep from "./steps/personal-info-step"
import VerificationIntroStep from "./steps/verification-intro-step"
import SuccessStep from "./steps/success-step"
import StepIndicator from "./step-indicator"

export type SignupFormData = {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
  birthDate: string
  address: string
  city: string
  postalCode: string
  agreeTerms: boolean
}

const initialFormData: SignupFormData = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  phone: "",
  birthDate: "",
  address: "",
  city: "",
  postalCode: "",
  agreeTerms: false
}

export default function SignupForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<SignupFormData>(initialFormData)
  const [userId, setUserId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const totalSteps = 4
  
  const updateFormData = (data: Partial<SignupFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }
  
  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Validar datos de cuenta antes de continuar
      if (!formData.email || !formData.password || formData.password !== formData.confirmPassword) {
        return
      }
    } else if (currentStep === 2) {
      // Validar datos personales antes de continuar
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.agreeTerms) {
        return
      }
      
      // Crear cuenta en el backend
      setIsSubmitting(true)
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message || 'Error al crear la cuenta')
        }
        
        // Guardar el ID del usuario para la verificación
        setUserId(data.user.id)
      } catch (error) {
        console.error('Error al registrar:', error)
        alert('Error al crear la cuenta. Por favor, inténtalo de nuevo.')
        setIsSubmitting(false)
        return
      }
      setIsSubmitting(false)
    }
    
    setCurrentStep(prev => Math.min(prev + 1, totalSteps))
  }
  
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }
  
  const handleComplete = () => {
    router.push('/verification/dni')
  }
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AccountStep 
            formData={formData} 
            updateFormData={updateFormData} 
            onNext={handleNextStep} 
          />
        )
      case 2:
        return (
          <PersonalInfoStep 
            formData={formData} 
            updateFormData={updateFormData} 
            onNext={handleNextStep} 
            onBack={handlePrevStep}
            isSubmitting={isSubmitting}
          />
        )
      case 3:
        return (
          <VerificationIntroStep 
            onNext={handleNextStep} 
            onBack={handlePrevStep}
          />
        )
      case 4:
        return (
          <SuccessStep 
            onComplete={handleComplete}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </div>
        
        {renderStep()}
      </div>
    </div>
  )
}
