import { prisma } from "@/lib/utils"
import { cache } from 'react'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from 'uuid'
import { put } from '@vercel/blob'
export const getItemById = cache(async (itemId: string) => {
  try {
    const reviews = await prisma.item.findMany({
      where: { id: itemId },
      select: {
        id: true,
        createdAt: true,
        title: true,
        description: true,
        price: true,
        location: true,
        deposit: true,
        features: true,
        reviews:{
            select: {
                rating: true,
                comment: true,
                createdAt: true,
        }
        },
        category: true,
        images: true,
        ownerId: true,
        owner: {
          select: {
            id: true,
            reviews:{
                select: {
                    rating: true,
                    comment: true,
                    createdAt: true,
            }
            },
            firstName: true,
            lastName: true,
            profileImage: true,
            createdAt: true,
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




