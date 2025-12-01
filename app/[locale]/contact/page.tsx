import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Mail, MessageSquare, MapPin, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Contacto | Tolio",
  description: "Ponte en contacto con el equipo de Tolio",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold mb-4">Contactanos</h1>
          <p className="text-xl text-purple-100">
            Estamos aquí para ayudarte
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de Contacto</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="text-gray-600">soporte@tolio.app</p>
                  <p className="text-sm text-gray-500 mt-1">Te respondemos en menos de 24 horas</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Instagram</h3>
                  <a 
                    href="https://www.instagram.com/tolio.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700"
                  >
                    @tolio.app
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Síguenos para novedades</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ubicación</h3>
                  <p className="text-gray-600">Bahía Blanca, Argentina</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Horario de atención</h3>
                  <p className="text-gray-600">Lunes a Viernes</p>
                  <p className="text-sm text-gray-500">9:00 - 18:00 (Argentina)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Envíanos un mensaje</h2>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Asunto
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecciona un tema</option>
                  <option value="general">Consulta general</option>
                  <option value="support">Soporte técnico</option>
                  <option value="billing">Pagos y facturación</option>
                  <option value="report">Reportar un problema</option>
                  <option value="suggestion">Sugerencia</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
              >
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>

        {/* Help link */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            ¿Buscas respuestas rápidas? Visita nuestro{" "}
            <Link href="/help" className="text-purple-600 hover:text-purple-700 font-medium">
              Centro de Ayuda
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
