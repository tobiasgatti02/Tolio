"use client"

import { CheckCircle } from "lucide-react"

interface VerificationCompleteProps {
  onComplete: () => void
}

export default function VerificationComplete({ onComplete }: VerificationCompleteProps) {
  return (
    <div className="text-center py-8">
      <div className="bg-emerald-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
        <CheckCircle className="h-12 w-12 text-emerald-600" />
      </div>

      <h2 className="text-xl font-bold mb-2">¡Verificación exitosa!</h2>

      <p className="text-gray-600 mb-6">
        Tu identidad ha sido verificada correctamente. Ahora puedes disfrutar de todos los beneficios de Tolio.
      </p>

      <button
        onClick={onComplete}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium"
      >
        Ir al panel de usuario
      </button>
    </div>
  )
}

