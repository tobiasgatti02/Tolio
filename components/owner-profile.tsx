import Image from "next/image"
import Link from "next/link"
import { Star, MessageCircle } from "lucide-react"

interface OwnerProfileProps {
  owner: {
    id: string
    name: string
    rating: number
    reviews: number
    memberSince: string
    responseRate: number
    image: string
  }
}

export default function OwnerProfile({ owner }: OwnerProfileProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Dueño del artículo</h3>
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
            {owner.rating} · {owner.reviews} reviews
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-700 space-y-2 mb-4">
        <div>Miembro desde {owner.memberSince}</div>
        <div>{owner.responseRate}% tiempo de respuesta</div>
      </div>

      <Link
        href={`/messages/${owner.id}`}
        className="w-full flex items-center justify-center bg-white border border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg font-medium"
      >
        <MessageCircle className="h-5 w-5 mr-2" />
        Contactá al dueño
      </Link>
    </div>
  )
}

