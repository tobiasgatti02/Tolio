import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { nombre: 'asc' }
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}
