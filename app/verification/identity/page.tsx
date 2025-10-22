import type { Metadata } from "next"
import IdentityVerificationForm from "@/components/verification/identity-verification-form"

export const metadata: Metadata = {
  title: "Verificación de Identidad | Prestar",
  description: "Verifica tu identidad con DNI y selfie",
}

export default function IdentityVerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <IdentityVerificationForm />
      </div>
    </div>
  )
}
