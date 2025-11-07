import Image from "next/image"
import Link from "next/link"
import { Star, MessageCircle, Phone } from "lucide-react"

interface OwnerProfileProps {
  owner: {
    id: string
    name: string
    rating: number
    reviews: number
    memberSince: Date
    responseRate: number
    image: string
    phoneNumber?: string
  }
}

export default function OwnerProfile({ owner }: OwnerProfileProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Dueño</h3>
      <div className="flex items-center mb-4">
        <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
          <Image src={owner.image || "/placeholder.svg"} alt={owner.name} fill className="object-cover" />
        </div>
        <div>
          <Link href={`/users/${owner.id}`} className="font-medium hover:text-emerald-600">
            {owner.name}
          </Link>
          <div className="flex items-center text-sm text-gray-500">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
            {owner.rating} · {owner.reviews} confianza
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-700 space-y-2 mb-4">
        <div>Miembro desde: {owner.memberSince.toLocaleDateString()}</div>
        <div>{owner.responseRate}% Tiempo de respuesta</div>
      </div>

      <div className="space-y-2">
        <Link
          href={`/messages/${owner.id}`}
          className="w-full flex items-center justify-center bg-white border border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Contacta al dueño
        </Link>
        
        {owner.phoneNumber && (
          <a
            href={`https://wa.me/${owner.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Me interesa un item que vi en Tolio.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Phone className="h-5 w-5 mr-2" />
            WhatsApp
          </a>
        )}
      </div>
    </div>
  )
}

