import type { Metadata } from "next"
import Link from "next/link"
import { Shield, CheckCircle, AlertTriangle, HelpCircle, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Protección y Seguro | Tolio",
  description: "Protección para tus préstamos y artículos compartidos",
}

export default function InsurancePage() {
  // Planes de seguro
  const insurancePlans = [
    {
      name: "Básico",
      price: "Gratis",
      coverage: "Hasta 100€",
      features: ["Verificación básica de usuarios", "Depósito de seguridad", "Soporte por email"],
      notIncluded: ["Protección contra daños", "Protección contra robo", "Resolución de disputas prioritaria"],
      recommended: false,
      buttonText: "Plan actual",
      buttonVariant: "outline",
    },
    {
      name: "Estándar",
      price: "2,99€/mes",
      coverage: "Hasta 500€",
      features: [
        "Verificación avanzada de usuarios",
        "Depósito de seguridad",
        "Protección contra daños básica",
        "Soporte prioritario",
        "Resolución de disputas en 48h",
      ],
      notIncluded: ["Protección contra robo", "Reembolso garantizado"],
      recommended: true,
      buttonText: "Actualizar",
      buttonVariant: "default",
    },
    {
      name: "Premium",
      price: "5,99€/mes",
      coverage: "Hasta 2.000€",
      features: [
        "Verificación avanzada de usuarios",
        "Depósito de seguridad reducido",
        "Protección completa contra daños",
        "Protección contra robo",
        "Soporte prioritario 24/7",
        "Resolución de disputas en 24h",
        "Reembolso garantizado",
      ],
      notIncluded: [],
      recommended: false,
      buttonText: "Actualizar",
      buttonVariant: "outline",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Protección y Seguro para Préstamos</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Protege tus artículos y préstamos con nuestros planes de seguro. Disfruta de tranquilidad sabiendo que estás
          cubierto ante cualquier imprevisto.
        </p>
      </div>

      {/* Planes de seguro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {insurancePlans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-xl shadow-sm overflow-hidden border ${
              plan.recommended ? "border-emerald-500" : "border-gray-200"
            }`}
          >
            {plan.recommended && (
              <div className="bg-emerald-500 text-white text-center py-2 text-sm font-medium">Recomendado</div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.price !== "Gratis" && <span className="text-gray-500 text-sm"> por préstamo</span>}
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2 mb-6">
                <span className="text-sm font-medium">Cobertura: {plan.coverage}</span>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Incluye:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.notIncluded.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">No incluye:</h4>
                  <ul className="space-y-2">
                    {plan.notIncluded.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className={`w-full py-2 rounded-lg font-medium ${
                  plan.buttonVariant === "default"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cómo funciona */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Cómo funciona nuestra protección</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Protección preventiva</h3>
            <p className="text-gray-600">
              Verificamos la identidad de todos los usuarios y establecemos un sistema de depósito de seguridad para
              garantizar la devolución de los artículos.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Durante el préstamo</h3>
            <p className="text-gray-600">
              Nuestro sistema de verificación de entrega y devolución documenta el estado del artículo en cada etapa,
              proporcionando evidencia en caso de disputas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <HelpCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Resolución de problemas</h3>
            <p className="text-gray-600">
              Si surge algún problema, nuestro equipo de resolución de disputas interviene para mediar y garantizar una
              solución justa para ambas partes.
            </p>
          </div>
        </div>
      </div>

      {/* Preguntas frecuentes */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Preguntas frecuentes</h2>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b p-6">
            <h3 className="text-lg font-bold mb-2">¿Qué ocurre si un artículo se daña durante el préstamo?</h3>
            <p className="text-gray-600">
              Si tienes un plan Estándar o Premium, cubrimos los daños según los términos de la póliza. Con el plan
              Básico, se utilizará el depósito de seguridad para cubrir los daños.
            </p>
          </div>

          <div className="border-b p-6">
            <h3 className="text-lg font-bold mb-2">¿Cómo se gestiona el depósito de seguridad?</h3>
            <p className="text-gray-600">
              El depósito se bloquea temporalmente en la cuenta del prestatario y se libera automáticamente cuando el
              propietario confirma la devolución en buen estado.
            </p>
          </div>

          <div className="border-b p-6">
            <h3 className="text-lg font-bold mb-2">¿Qué pasa si alguien no devuelve mi artículo?</h3>
            <p className="text-gray-600">
              Primero intentamos contactar con el prestatario. Si no hay respuesta, retenemos el depósito y, dependiendo
              de tu plan de seguro, podemos cubrir el valor restante del artículo.
            </p>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-bold mb-2">¿Cómo se resuelven las disputas?</h3>
            <p className="text-gray-600">
              Nuestro equipo de resolución de disputas revisa la evidencia proporcionada por ambas partes (fotos,
              mensajes, verificaciones) y toma una decisión imparcial basada en nuestras políticas.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl text-white p-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-2">Protege tus préstamos hoy mismo</h2>
            <p className="text-white/90 max-w-xl">
              Disfruta de la tranquilidad que ofrece nuestra protección integral. Comparte tus artículos sin
              preocupaciones y forma parte de la economía colaborativa de forma segura.
            </p>
          </div>
          <Link
            href="/insurance/upgrade"
            className="bg-white text-emerald-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium flex items-center"
          >
            Mejorar mi protección
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

