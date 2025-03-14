import { Metadata } from "next"
import CreateItemForm from "@/components/create-item-form"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"

export const metadata: Metadata = {
  title: "Publicar un artículo | Prestar",
  description: "Publica un artículo para prestar en nuestra plataforma",
}

export default function CreateItemPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/dashboard" className="flex items-center text-emerald-600 mb-8 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver al panel
      </Link>

      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Publicar un artículo</h1>
        <p className="text-gray-600 text-center mb-8">
          Completa el formulario a continuación para publicar tu artículo y comenzar a ganar dinero prestándolo.
        </p>

        <CreateItemForm />
      </div>
    </div>
  )
}
