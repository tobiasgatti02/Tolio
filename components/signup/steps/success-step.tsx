"use client"

import { CheckCircle } from "lucide-react"

interface SuccessStepProps {
  onComplete: () => void
}

export default function SuccessStep({ onComplete }: SuccessStepProps) {
  return (
    <div className="text-center">
      <div className="bg-emerald-100 p-4 rounded-full inline-flex items-center justify-center mb-6">
        <CheckCircle className="h-12 w-12 text-emerald-600" />
      </div>

      <h1 className="text-2xl font-bold mb-4">¡Cuenta creada con éxito!</h1>

      <p className="text-gray-600 mb-8">
        Tu cuenta ha sido creada correctamente. Ahora, vamos a verificar tu identidad con tu DNI.
      </p>

      <button
        type="button"
        onClick={onComplete}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium"
      >
        Verificar mi identidad
      </button>
    </div>
  )
}

