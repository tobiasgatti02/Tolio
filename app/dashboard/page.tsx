import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Tolio",
  description: "Tu panel personal de Tolio - Gestiona tus artículos, reservas y más",
}

export default function DashboardPage() {
  // El contenido principal se renderiza en el CleanDashboard cuando pathname === '/dashboard'
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resumen del Dashboard</h1>
        <p className="text-gray-600">Bienvenido de vuelta. Aquí tienes un resumen de tu actividad.</p>
      </div>
    </div>
  )
}
