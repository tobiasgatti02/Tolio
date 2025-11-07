import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils'

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      where: {
        isAvailable: true,
      },
      take: 8,
      orderBy: [{ createdAt: 'desc' }],
      include: {
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

    const featuredItems = items.map((item) => {
      const reviews = item.reviews || []
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const rating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : undefined

      return {
        id: item.id,
        title: item.title,
        category: item.category || "Sin categoría",
   
        rating: rating,
        reviewCount: reviews.length > 0 ? reviews.length : undefined,
        location: item.location,
        image: item.images && item.images.length > 0 ? item.images[0] : "/placeholder.svg",
        owner: {
          firstName: item.owner.firstName,
          lastName: item.owner.lastName,
        },
      }
    })

    return NextResponse.json(featuredItems)
  } catch (err) {
    console.error('Error fetching featured items:', err instanceof Error ? err.message : String(err))
    return NextResponse.json(
      { error: 'Failed to fetch featured items' },
      { status: 500 }
    )
  }
}
// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
