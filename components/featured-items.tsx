import { Suspense } from "react"
import { prisma } from '@/lib/utils'
import FeaturedItemsClient, { FeaturedItem } from './featured-items-client'
import FeaturedItemsSkeleton from "./featured-items-skeleton"
import { unstable_cache } from 'next/cache'

// Cache la función por 5 minutos
const getFeaturedItems = unstable_cache(
  async () => {
    const items = await prisma.item.findMany({
      where: {
        isAvailable: true,
      },
      take: 8, // Aumentamos a 8 items
      orderBy: [{ createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        price: true,
        location: true,
        images: true,
        category: {
          select: {
            name: true
          }
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    })

    return items.map((item) => {
      const reviews = item.reviews || []
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const rating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : undefined
      
      return {
        id: item.id,
        title: item.title,
        category: item.category?.name || "Sin categoría",
        price: item.price,
        rating: rating,
        reviewCount: reviews.length > 0 ? reviews.length : undefined,
        location: item.location,
        image: item.images[0] || "/placeholder.svg",
        owner: {
          firstName: item.owner.firstName,
          lastName: item.owner.lastName,
        },
      }
    })
  },
  ['featured-items'],
  {
    revalidate: 300, // 5 minutos
    tags: ['featured-items']
  }
)

export default async function FeaturedItems() {
  const formattedItems: FeaturedItem[] = await getFeaturedItems()

  return (
    <Suspense fallback={<FeaturedItemsSkeleton />}>
      <FeaturedItemsClient items={formattedItems} />
    </Suspense>
  )
}