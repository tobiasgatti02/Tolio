import { Suspense } from "react"
import FeaturedItemsClient, { FeaturedItem } from './featured-items-client'
import FeaturedItemsSkeleton from "./featured-items-skeleton"

// Función del servidor para obtener items destacados
async function getFeaturedItems(): Promise<FeaturedItem[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/items/featured`, {
      next: { revalidate: 300 }, // Cache por 5 minutos
    })

    if (!response.ok) {
      throw new Error('Failed to fetch featured items')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching featured items:', error)
    return []
  }
}

export default async function FeaturedItems() {
  const formattedItems: FeaturedItem[] = await getFeaturedItems()

  return (
    <Suspense fallback={<FeaturedItemsSkeleton />}>
      <FeaturedItemsClient items={formattedItems} />
    </Suspense>
  )
}