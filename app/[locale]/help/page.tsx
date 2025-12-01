import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Search, BookOpen, MessageCircle, Shield, CreditCard, HelpCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Centro de Ayuda | Tolio",
  description: "Encuentra respuestas a tus preguntas sobre cómo usar Tolio",
}

const faqs = [
  {
    category: "Empezando",
    icon: BookOpen,
    questions: [
      {
        q: "¿Cómo me registro en Tolio?",
        a: "Puedes registrarte con tu email o usando tu cuenta de Google. Solo necesitas completar tu perfil y verificar tu identidad para comenzar a usar la plataforma."
      },
      {
        q: "¿Es gratis usar Tolio?",
        a: "Sí, crear una cuenta y publicar artículos o servicios es completamente gratis. Solo cobramos una pequeña comisión cuando se completa una transacción exitosa."
      },
      {
        q: "¿Cómo publico una herramienta o servicio?",
        a: "Una vez registrado, haz clic en 'Publicar' en el menú. Sigue los pasos para agregar fotos, descripción, precio y ubicación. Tu publicación estará visible inmediatamente."
      }
    ]
  },
  {
    category: "Alquileres y Reservas",
    icon: CreditCard,
    questions: [
      {
        q: "¿Cómo hago una reserva?",
        a: "Encuentra el artículo que necesitas, selecciona las fechas y envía una solicitud de reserva. El propietario recibirá una notificación y podrá aceptar o rechazar tu solicitud."
      },
      {
        q: "¿Qué es el depósito de seguridad?",
        a: "El depósito es un monto que se retiene como garantía durante el alquiler. Se devuelve completamente al finalizar si el artículo se devuelve en buen estado."
      },
      {
        q: "¿Puedo cancelar una reserva?",
        a: "Sí, puedes cancelar una reserva antes de que comience. Las políticas de cancelación varían según el propietario, revisa los términos antes de reservar."
      }
    ]
  },
  {
    category: "Seguridad",
    icon: Shield,
    questions: [
      {
        q: "¿Cómo verifico mi identidad?",
        a: "Durante el registro te pediremos una foto de tu documento de identidad y una selfie para verificar que eres quien dices ser. Este proceso es seguro y confidencial."
      },
      {
        q: "¿Qué pasa si hay un problema con un alquiler?",
        a: "Contacta primero al otro usuario para resolver el problema. Si no llegan a un acuerdo, nuestro equipo de soporte puede mediar y ayudar a encontrar una solución."
      },
      {
        q: "¿Cómo sé si un usuario es confiable?",
        a: "Revisa las reseñas de otros usuarios, la puntuación de confianza y si tiene el badge de identidad verificada. Estos indicadores te ayudan a tomar mejores decisiones."
      }
    ]
  },
  {
    category: "Pagos",
    icon: CreditCard,
    questions: [
      {
        q: "¿Qué métodos de pago aceptan?",
        a: "Aceptamos tarjetas de crédito y débito a través de nuestra plataforma segura de pagos. Los pagos se procesan de forma segura y encriptada."
      },
      {
        q: "¿Cuándo recibo el pago como propietario?",
        a: "Los pagos se liberan 24 horas después de que se completa el alquiler exitosamente. El dinero se transfiere directamente a tu cuenta bancaria configurada."
      },
      {
        q: "¿Cuál es la comisión de Tolio?",
        a: "Cobramos una comisión del 10% sobre el monto del alquiler. Esta comisión nos permite mantener la plataforma y ofrecer soporte a la comunidad."
      }
    ]
  }
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-green-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-green-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold mb-4">Centro de Ayuda</h1>
          <p className="text-xl text-green-100">
            Encuentra respuestas a las preguntas más frecuentes
          </p>
        </div>
      </div>

      {/* Search (decorativo por ahora) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en el centro de ayuda..."
            className="flex-1 outline-none text-gray-700"
          />
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {faqs.map((section, idx) => (
          <section key={idx} className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <section.icon className="h-6 w-6 text-gray-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{section.category}</h2>
            </div>
            <div className="space-y-4">
              {section.questions.map((faq, faqIdx) => (
                <details 
                  key={faqIdx} 
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                    <span className="font-medium text-gray-900">{faq.q}</span>
                    <HelpCircle className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 text-gray-600">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        {/* Contact CTA */}
        <section className="bg-gray-100 rounded-2xl p-8 text-center mt-12">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">¿No encontraste lo que buscabas?</h2>
          <p className="text-gray-600 mb-6">
            Nuestro equipo está listo para ayudarte con cualquier pregunta.
          </p>
          <Link
            href="/contact"
            className="inline-flex px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Contactar soporte
          </Link>
        </section>
      </div>
    </div>
  )
}
