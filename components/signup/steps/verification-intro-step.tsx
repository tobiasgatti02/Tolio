"use client"

import { Shield, CheckCircle } from "lucide-react"

interface VerificationIntroStepProps {
  onNext: () => void
  onBack: () => void
}

export default function VerificationIntroStep({ onNext, onBack }: VerificationIntroStepProps) {
  return (
    <div className="text-center">
      <div className="bg-emerald-100 p-4 rounded-full inline-flex items-center justify-center mb-6">
        <Shield className="h-12 w-12 text-emerald-600" />
      </div>

      <h1 className="text-2xl font-bold mb-4">Verificación de identidad</h1>

      <p className="text-gray-600 mb-6">
        Para garantizar la seguridad de nuestra comunidad, necesitamos verificar tu identidad con tu DNI.
      </p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h3 className="font-medium mb-2">Necesitarás:</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Tu DNI argentino vigente</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Buena iluminación para tomar fotos claras</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Unos minutos para completar el proceso</span>
          </li>
        </ul>
      </div>

      <p className="text-sm text-gray-500 mb-8">
        Tus datos están seguros y protegidos. Solo los utilizamos para verificar tu identidad.
      </p>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Atrás
        </button>

        <button
          type="button"
          onClick={onNext}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

