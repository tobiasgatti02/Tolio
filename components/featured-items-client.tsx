"use client"

import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

export interface FeaturedItem {
  id: string
  title: string
  category: string
  price: number
  rating?: number
  reviewCount?: number
  image: string
  location: string
  owner: {
    firstName: string
    lastName: string
  }
}

interface FeaturedItemsClientProps {
  items: FeaturedItem[]
}

export default function FeaturedItemsClient({ items }: FeaturedItemsClientProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <Link key={item.id} href={`/items/${item.id}`} className="group">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
            <div className="relative h-48 w-full">
              <Image 
                src={item.image || "/placeholder.svg"} 
                alt={item.title} 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="p-4">
              <div className="text-xs font-medium text-emerald-600 mb-1">{item.category}</div>
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                {item.title}
              </h3>
              {(item.rating !== undefined && item.reviewCount !== undefined) && (
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium ml-1">{item.rating}</span>
                  <span className="text-xs text-gray-500 ml-1">({item.reviewCount} reviews)</span>
                </div>
              )}
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