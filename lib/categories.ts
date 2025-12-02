import prisma from "@/lib/prisma"



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
