import { Metadata } from "next"
import SignupForm from "@/components/signup/signup-form"

export const metadata: Metadata = {
  title: "Registro | Tolio",
  description: "Crea una cuenta en Tolio y comienza a compartir",
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <SignupForm />
      </div>
    </div>
  )
}
