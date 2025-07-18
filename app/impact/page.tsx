import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Leaf, Recycle, DollarSign, Users, TrendingUp, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "Tu Impacto | Tolio",
  description: "Descubre el impacto positivo que generas al compartir recursos",
}

export default function ImpactPage() {
  // Datos de ejemplo para el impacto del usuario
  const userImpact = {
    co2Saved: 127.5, // kg de CO2 ahorrados
    resourcesSaved: 3450, // recursos naturales ahorrados en kg
    moneySaved: 1250, // dinero ahorrado por la comunidad en €
    itemsShared: 15, // número de artículos compartidos
    totalTransactions: 28, // número total de transacciones
    impactRank: "Pionero Ecológico", // rango de impacto
    communityRank: 342, // posición en el ranking de la comunidad
    totalUsers: 5280, // total de usuarios en la plataforma
  }

  // Calcular porcentaje para el ranking
  const rankPercentage = 100 - Math.round((userImpact.communityRank / userImpact.totalUsers) * 100)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Tu Impacto Positivo</h1>
      <p className="text-gray-600 mb-8">
        Descubre cómo estás contribuyendo a un mundo más sostenible al compartir recursos.
      </p>

      {/* Tarjeta de impacto principal */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl text-white p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">¡Felicidades!</h2>
            <p className="text-white/90 mb-4">
              Has alcanzado el nivel de <span className="font-bold">{userImpact.impactRank}</span>
            </p>
            <div className="flex items-center">
              <Award className="h-6 w-6 mr-2" />
              <span>Estás en el top {rankPercentage}% de usuarios con mayor impacto</span>
            </div>
          </div>
          <div className="mt-6 md:mt-0">
            <div className="bg-white/20 p-4 rounded-lg">
              <div className="text-4xl font-bold">{userImpact.co2Saved}</div>
              <div className="text-white/90">kg de CO₂ ahorrados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de impacto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="bg-emerald-100 p-3 rounded-full mr-3">
              <Leaf className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold">Impacto Ambiental</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>CO₂ ahorrado</span>
                <span className="font-medium">{userImpact.co2Saved} kg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Recursos naturales ahorrados</span>
                <span className="font-medium">{userImpact.resourcesSaved} kg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: "45%" }}></div>
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-4">Equivale a plantar aproximadamente 6 árboles</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold">Impacto Económico</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Dinero ahorrado por la comunidad</span>
                <span className="font-medium">{userImpact.moneySaved} $</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "70%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Ingresos generados</span>
                <span className="font-medium">420 €</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "35%" }}></div>
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-4">
              Has ayudado a que la economía circular crezca en tu comunidad
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full mr-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold">Impacto Social</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Artículos compartidos</span>
                <span className="font-medium">{userImpact.itemsShared}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "55%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Transacciones completadas</span>
                <span className="font-medium">{userImpact.totalTransactions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "60%" }}></div>
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-4">Has conectado con 18 personas de tu comunidad</div>
          </div>
        </div>
      </div>

      {/* Insignias y logros */}
      <h2 className="text-2xl font-bold mb-6">Tus Insignias y Logros</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-12">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <div className="bg-emerald-100 p-3 rounded-full mx-auto mb-3 w-16 h-16 flex items-center justify-center">
            <Leaf className="h-8 w-8 text-emerald-600" />
          </div>
          <h4 className="font-medium mb-1">Eco Warrior</h4>
          <p className="text-xs text-gray-500">Ahorraste 100kg de CO₂</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <div className="bg-blue-100 p-3 rounded-full mx-auto mb-3 w-16 h-16 flex items-center justify-center">
            <Recycle className="h-8 w-8 text-blue-600" />
          </div>
          <h4 className="font-medium mb-1">Reciclador</h4>
          <p className="text-xs text-gray-500">Compartiste 10+ artículos</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <div className="bg-purple-100 p-3 rounded-full mx-auto mb-3 w-16 h-16 flex items-center justify-center">
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <h4 className="font-medium mb-1">Conectador</h4>
          <p className="text-xs text-gray-500">20+ transacciones</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 text-center opacity-40">
          <div className="bg-gray-100 p-3 rounded-full mx-auto mb-3 w-16 h-16 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="font-medium mb-1">Influencer</h4>
          <p className="text-xs text-gray-500">Invita a 5 amigos</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 text-center opacity-40">
          <div className="bg-gray-100 p-3 rounded-full mx-auto mb-3 w-16 h-16 flex items-center justify-center">
            <Award className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="font-medium mb-1">Superstar</h4>
          <p className="text-xs text-gray-500">Obtén 50 reseñas 5★</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 text-center opacity-40">
          <div className="bg-gray-100 p-3 rounded-full mx-auto mb-3 w-16 h-16 flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="font-medium mb-1">Emprendedor</h4>
          <p className="text-xs text-gray-500">Gana 1000€ prestando</p>
        </div>
      </div>

      {/* Impacto comunitario */}
      <h2 className="text-2xl font-bold mb-6">Impacto de la Comunidad</h2>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-600 mb-2">12.5 ton</div>
            <p className="text-gray-600">CO₂ ahorrado por la comunidad</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">125.000 €</div>
            <p className="text-gray-600">Dinero ahorrado en compras</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">3.200</div>
            <p className="text-gray-600">Artículos compartidos este mes</p>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-bold mb-4">Ranking de Impacto</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Posición</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Usuario</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">CO₂ Ahorrado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Artículos</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nivel</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 text-sm">1</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden mr-3">
                        <Image
                          src="/placeholder.svg?height=100&width=100"
                          alt="Usuario"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium">María G.</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">352 kg</td>
                  <td className="py-3 px-4 text-sm">42</td>
                  <td className="py-3 px-4">
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                      Maestro Ecológico
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 text-sm">2</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden mr-3">
                        <Image
                          src="/placeholder.svg?height=100&width=100"
                          alt="Usuario"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium">Carlos R.</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">298 kg</td>
                  <td className="py-3 px-4 text-sm">36</td>
                  <td className="py-3 px-4">
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                      Maestro Ecológico
                    </span>
                  </td>
                </tr>
                <tr className="border-b bg-emerald-50">
                  <td className="py-3 px-4 text-sm font-bold">342</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden mr-3">
                        <Image
                          src="/placeholder.svg?height=100&width=100"
                          alt="Tu perfil"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium">Tú</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-bold">{userImpact.co2Saved} kg</td>
                  <td className="py-3 px-4 text-sm font-bold">{userImpact.itemsShared}</td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {userImpact.impactRank}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Llamada a la acción */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl text-white p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">¡Aumenta tu impacto positivo!</h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Comparte más artículos, invita a tus amigos y ayuda a construir una comunidad más sostenible. Cada préstamo
          cuenta para un futuro mejor.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/items/create"
            className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium"
          >
            Compartir un artículo
          </Link>
          <Link href="/invite" className="bg-blue-700 text-white hover:bg-blue-800 px-6 py-3 rounded-lg font-medium">
            Invitar amigos
          </Link>
        </div>
      </div>
    </div>
  )
}

