import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Calendar, Users, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Comunidad | Tolio",
  description: "Conecta con tu comunidad local y participa en eventos",
}

export default function CommunityPage() {
  // Datos de ejemplo para eventos
  const events = [
    {
      id: "1",
      title: "Taller de reparación de bicicletas",
      date: new Date("2023-12-15T18:00:00"),
      location: "Parque Central, Barcelona",
      image: "/placeholder.svg?height=300&width=400",
      attendees: 18,
      category: "Taller",
    },
    {
      id: "2",
      title: "Intercambio de herramientas de jardinería",
      date: new Date("2023-12-20T11:00:00"),
      location: "Centro Cívico El Carmel, Barcelona",
      image: "/placeholder.svg?height=300&width=400",
      attendees: 24,
      category: "Intercambio",
    },
    {
      id: "3",
      title: "Charla: Economía circular en tu barrio",
      date: new Date("2023-12-18T19:30:00"),
      location: "Biblioteca Sagrada Familia, Barcelona",
      image: "/placeholder.svg?height=300&width=400",
      attendees: 32,
      category: "Charla",
    },
  ]

  // Datos de ejemplo para grupos
  const groups = [
    {
      id: "1",
      name: "Makers Barcelona",
      members: 156,
      image: "/placeholder.svg?height=200&width=200",
      description: "Grupo de entusiastas del DIY y la fabricación digital",
    },
    {
      id: "2",
      name: "Jardineros Urbanos",
      members: 89,
      image: "/placeholder.svg?height=200&width=200",
      description: "Compartimos herramientas y conocimientos de jardinería urbana",
    },
    {
      id: "3",
      name: "Fotógrafos Amateur",
      members: 112,
      image: "/placeholder.svg?height=200&width=200",
      description: "Préstamo de equipos fotográficos y salidas en grupo",
    },
  ]

  // Función para formatear fechas
  const formatDate = (date: Date) => {
    return (
      date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }) +
      " · " +
      date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Comunidad Tolio</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Conecta con personas de tu zona, participa en eventos y forma parte de grupos con intereses similares.
          Comparte más que objetos, comparte experiencias.
        </p>
      </div>

      {/* Mapa de la comunidad */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-12">
        <div className="relative h-96 w-full">
          <Image
            src="/placeholder.svg?height=800&width=1200"
            alt="Mapa de la comunidad"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Explora tu comunidad local</h2>
              <p className="mb-4">Descubre artículos, eventos y grupos cerca de ti</p>
              <div className="flex flex-wrap gap-2">
                <button className="bg-white text-emerald-600 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium">
                  Barcelona
                </button>
                <button className="bg-white/20 text-white hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium">
                  Madrid
                </button>
                <button className="bg-white/20 text-white hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium">
                  Valencia
                </button>
                <button className="bg-white/20 text-white hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium">
                  Sevilla
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos eventos */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Próximos eventos</h2>
          <Link
            href="/community/events"
            className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
          >
            Ver todos
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link key={event.id} href={`/community/events/${event.id}`} className="group">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="relative h-48 w-full">
                  <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">{event.category}</span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  <div className="mt-auto flex items-center text-sm">
                    <Users className="h-4 w-4 mr-1 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">{event.attendees} asistentes</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Grupos de la comunidad */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Grupos de la comunidad</h2>
          <Link
            href="/community/groups"
            className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
          >
            Ver todos
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link key={group.id} href={`/community/groups/${group.id}`} className="group">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4">
                    <Image src={group.image || "/placeholder.svg"} alt={group.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {group.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{group.members} miembros</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                <button className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-2 rounded-lg text-sm font-medium">
                  Unirse al grupo
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Historias de la comunidad */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Historias de la comunidad</h2>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative h-64 md:h-auto">
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Historia de la comunidad"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6 md:p-8">
              <span className="text-emerald-600 text-sm font-medium mb-2 block">Historia destacada</span>
              <h3 className="text-xl font-bold mb-3">"Cómo un taladro compartido construyó una comunidad"</h3>
              <p className="text-gray-600 mb-4">
                Miguel comenzó prestando su taladro a sus vecinos. Hoy, lidera un grupo de 50 personas que comparten
                herramientas y conocimientos, organizando talleres mensuales de bricolaje en su barrio.
              </p>
              <Link
                href="/community/stories/1"
                className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
              >
                Leer historia completa
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA para crear un evento */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl text-white p-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-2">¿Tienes una idea para un evento?</h2>
            <p className="text-white/90 max-w-xl">
              Organiza un evento en tu comunidad y conecta con personas que comparten tus intereses. Desde talleres de
              reparación hasta intercambios de artículos, ¡las posibilidades son infinitas!
            </p>
          </div>
          <Link
            href="/community/events/create"
            className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium flex items-center"
          >
            Crear un evento
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

