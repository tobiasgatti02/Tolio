import type { Metadata } from "next"
import DniVerificationForm from "@/components/verification/dni-verification-form"

export const metadata: Metadata = {
  title: "Verificación de DNI | Tolio",
  description: "Verifica tu identidad con tu DNI argentino",
}

export default function DniVerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <DniVerificationForm />
      </div>
    </div>
  )
}

