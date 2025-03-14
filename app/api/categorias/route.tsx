import { prisma } from "@/lib/utils"
import { NextResponse } from "next/server"
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


export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}