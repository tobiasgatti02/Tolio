import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/utils"
import { writeFile } from "fs"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { cache } from 'react'

export const getItemById = cache(async (itemId: string) => {
  console.log('start')
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




export async function getUserItems(userId: string) {
  return await prisma.item.findMany({
    where: { 
      ownerId: userId 
    },
    include: {
      bookings: {
        include: {
          borrower: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      category: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}



export async function getBorrowedItems(userId: string) {
  return await prisma.booking.findMany({
    where: {
      borrowerId: userId,
      status: {
        in: ['PENDING', 'CONFIRMED', 'COMPLETED']
      }
    },
    include: {
      item: {
        include: {
          category: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            }
          }
        }
      },
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}
function uuidv4() {
  throw new Error("Function not implemented.")
}

