import FeaturedItemsClient, { FeaturedItem } from './featured-items-client'
import prisma from "@/lib/prisma"



// Función del servidor para obtener items destacados directamente desde la base de datos
async function getFeaturedItems(): Promise<FeaturedItem[]> {
  try {
    // Obtener todos los items disponibles con sus reviews
    const items = await prisma.item.findMany({
      where: {
        isAvailable: true,
      },
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

    // Calcular rating promedio y ordenar
    const itemsWithRating = items.map((item) => {
      const reviews = item.reviews || []
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0

      return {
        ...item,
        avgRating,
        reviewCount: reviews.length,
      }
    })

    // Ordenar por rating (descendente), luego por cantidad de reviews, y finalmente por fecha
    const sortedItems = itemsWithRating
      .sort((a, b) => {
        // Primero por rating promedio
        if (b.avgRating !== a.avgRating) {
          return b.avgRating - a.avgRating
        }
        // Luego por cantidad de reviews
        if (b.reviewCount !== a.reviewCount) {
          return b.reviewCount - a.reviewCount
        }
        // Finalmente por fecha de creación
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
      .slice(0, 8) // Tomar los 8 mejores

    const featuredItems: FeaturedItem[] = sortedItems.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category || "Sin categoría",
      rating: item.avgRating > 0 ? Number(item.avgRating.toFixed(1)) : undefined,
      reviewCount: item.reviewCount > 0 ? item.reviewCount : undefined,
      location: item.location,
      image: item.images && item.images.length > 0 ? item.images[0] : "/placeholder.svg",
      owner: {
        firstName: item.owner.firstName,
        lastName: item.owner.lastName,
      },
    }))

    return featuredItems
  } catch (error) {
    console.error('Error fetching featured items:', error)
    return []
  }
}

export default async function FeaturedItems() {
  const formattedItems: FeaturedItem[] = await getFeaturedItems()

  return <FeaturedItemsClient items={formattedItems} />
}