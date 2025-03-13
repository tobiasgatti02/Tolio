import { prisma } from "@/lib/utils"
import { cache } from "react"

export const getCategories = cache(async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })

    return categories.map(category => ({
      ...category,
    }))
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    throw new Error("Failed to fetch categories")
  }
})