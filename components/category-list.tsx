import { PenToolIcon as Tool, Car, Laptop, Camera, Music, Book, Tent, Utensils } from "lucide-react"
import Link from "next/link"

const categories = [
  { name: "Tools", icon: Tool, slug: "tools" },
  { name: "Vehicles", icon: Car, slug: "vehicles" },
  { name: "Electronics", icon: Laptop, slug: "electronics" },
  { name: "Photography", icon: Camera, slug: "photography" },
  { name: "Musical Instruments", icon: Music, slug: "musical-instruments" },
  { name: "Books", icon: Book, slug: "books" },
  { name: "Camping Gear", icon: Tent, slug: "camping-gear" },
  { name: "Kitchen Appliances", icon: Utensils, slug: "kitchen-appliances" },
]

export default function CategoryList() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/category/${category.slug}`}
          className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
            <category.icon className="h-6 w-6 text-emerald-600" />
          </div>
          <span className="text-sm font-medium text-gray-800">{category.name}</span>
        </Link>
      ))}
    </div>
  )
}

