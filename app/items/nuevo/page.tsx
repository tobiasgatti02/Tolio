import { Metadata } from "next"
import EnhancedCreateItemForm from "@/components/create-item-form-enhanced"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"

export const metadata: Metadata = {
  title: "Publicar un artículo | Tolio",
  description: "Publica un artículo para alquilar en nuestra plataforma",
}

export default function CreateItemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="flex items-center text-emerald-600 mb-8 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al panel
        </Link>

        <EnhancedCreateItemForm />
      </div>
    </div>
  )
}
