import { Suspense } from "react"
import { prisma } from '@/lib/utils'
import FeaturedItemsClient, { FeaturedItem } from './featured-items-client'
import FeaturedItemsSkeleton from "./featured-items-skeleton"

export default async function FeaturedItems() {
  const items = await prisma.item.findMany({
    where: {
      isAvailable: true,
    },
    take: 4,
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

  const formattedItems: FeaturedItem[] = items.map((item) => {
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
      image: item.images[0] || "/placeholder.svg",
      location: item.location,
      owner: {
        firstName: item.owner.firstName,
        lastName: item.owner.lastName,
      },
    }
  })

  return (
    <Suspense fallback={<FeaturedItemsSkeleton />}>
      <FeaturedItemsClient items={formattedItems} />
    </Suspense>
  )
}