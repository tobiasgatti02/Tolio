import { Metadata } from "next"
import CreateServiceForm from "@/components/create-service-form"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"

export const metadata: Metadata = {
  title: "Ofrecer un Servicio | Tolio",
  description: "Publica tu servicio profesional en nuestra plataforma",
}

export default function NewServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/services"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a Servicios
        </Link>
        
        <CreateServiceForm />
      </div>
    </div>
  )
}
