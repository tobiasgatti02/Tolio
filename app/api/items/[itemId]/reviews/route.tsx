import { prisma } from "@/lib/utils"
import { cache } from 'react'

export const getReviewsByItemId = cache(async (itemId: string) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { itemId },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return reviews.map(review => ({
      ...review,
      createdAt: review.createdAt.toISOString(),
    }))
  } catch (error) {
    console.error("Failed to fetch reviews:", error)
    throw new Error("Failed to fetch reviews")
  }
})