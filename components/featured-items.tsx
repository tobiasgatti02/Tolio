import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

// In a real app, this would come from an API
const featuredItems = [
  {
    id: 1,
    title: "Professional Drill Set",
    category: "Tools",
    price: 15,
    rating: 4.8,
    reviews: 24,
    image: "/placeholder.svg?height=300&width=400",
    owner: "Michael S.",
    location: "Brooklyn, NY",
  },
  {
    id: 2,
    title: "DSLR Camera with Lenses",
    category: "Photography",
    price: 35,
    rating: 4.9,
    reviews: 42,
    image: "/placeholder.svg?height=300&width=400",
    owner: "Sarah L.",
    location: "Austin, TX",
  },
  {
    id: 3,
    title: "Mountain Bike",
    category: "Sports",
    price: 25,
    rating: 4.7,
    reviews: 18,
    image: "/placeholder.svg?height=300&width=400",
    owner: "David K.",
    location: "Denver, CO",
  },
  {
    id: 4,
    title: "Camping Tent (4-Person)",
    category: "Camping Gear",
    price: 20,
    rating: 4.6,
    reviews: 31,
    image: "/placeholder.svg?height=300&width=400",
    owner: "Emma R.",
    location: "Portland, OR",
  },
]

export default function FeaturedItems() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {featuredItems.map((item) => (
        <Link key={item.id} href={`/items/${item.id}`} className="group">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
            <div className="relative h-48 w-full">
              <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
            </div>
            <div className="p-4">
              <div className="text-xs font-medium text-emerald-600 mb-1">{item.category}</div>
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                {item.title}
              </h3>
              <div className="flex items-center mb-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium ml-1">{item.rating}</span>
                <span className="text-xs text-gray-500 ml-1">({item.reviews} reviews)</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-gray-900 font-bold">
                  ${item.price}
                  <span className="text-gray-500 font-normal text-sm">/day</span>
                </div>
                <div className="text-xs text-gray-500">{item.location}</div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

