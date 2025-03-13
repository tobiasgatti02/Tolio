import { prisma } from '@/lib/utils'
import FeaturedItemsClient, { FeaturedItem } from './featured-items-client'

// This is a server component that will fetch data from the database
export default async function FeaturedItems() {
  // Fetch featured items from the database
  const items = await prisma.item.findMany({
    where: {
      isAvailable: true,
    },
    take: 4,  // Limit to 4 featured items
    orderBy: [
      // You could add criteria here to select "featured" items
      { createdAt: 'desc' }  // For now, just show newest items
    ],
    select: {
      id: true,
      title: true,
      category: true,
      price: true,
      location: true,
      images: true,
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

  // Calculate average rating for each item
  const formattedItems: FeaturedItem[] = items.map((item) => {
    // Calculate average rating if reviews exist
    const reviews = item.reviews || []
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const rating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : undefined
    
    return {
      id: item.id,
      title: item.title,
      category: item.category,
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

  return <FeaturedItemsClient items={formattedItems} />
}