import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Star, MessageSquare, ThumbsUp, Filter, Search } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export const metadata = {
  title: "Reseñas | Tolio",
  description: "Gestiona las reseñas de tus artículos",
}

interface Review {
  id: string
  rating: number
  comment: string
  reviewer: {
    id: string
    name: string
    avatar: string | null
  }
  item: {
    id: string
    title: string
    image: string
  }
  type: 'received' | 'given'
  createdAt: Date | string
  response: string | null
}

// Función para formatear fechas
const formatDate = (date: Date) => {
  return format(date, "d 'de' MMMM, yyyy", { locale: es })
}

// Función para obtener reseñas del usuario directamente desde la BD
async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    // Obtener reviews como prestatario y como prestador
    const [reviewsAsLender, reviewsAsBorrower] = await Promise.all([
      // Reviews recibidas como prestador (mis artículos)
      prisma.review.findMany({
        where: {
          booking: {
            item: {
              ownerId: userId
            }
          }
        },
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          },
          booking: {
            include: {
              item: {
                select: {
                  id: true,
                  title: true,
                  images: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      
      // Reviews hechas como prestatario (de artículos que reservé)
      prisma.review.findMany({
        where: {
          reviewerId: userId
        },
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          },
          booking: {
            include: {
              item: {
                select: {
                  id: true,
                  title: true,
                  images: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ])
    
    // Combinar y formatear reviews
    const allReviews: Review[] = [...reviewsAsLender, ...reviewsAsBorrower].map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      reviewer: {
        id: review.reviewer.id,
        name: `${review.reviewer.firstName} ${review.reviewer.lastName}`.trim(),
        avatar: review.reviewer.profileImage
      },
      item: {
        id: review.booking.item.id,
        title: review.booking.item.title,
        image: review.booking.item.images[0]
      },
      type: reviewsAsLender.some(r => r.id === review.id) ? 'received' as const : 'given' as const,
      response: null // Campo para respuestas futuras
    }))
    
    await prisma.$disconnect()
    return allReviews
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    return []
  }
}

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/reviews")
  }
  
  const userId = session.user.id
  const reviews = await getUserReviews(userId)

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reseñas</h1>
          <p className="text-gray-600">Gestiona las reseñas de tus artículos</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total reseñas</p>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calificación promedio</p>
              <div className="flex items-center space-x-1">
                <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">5 estrellas</p>
              <p className="text-2xl font-bold text-gray-900">{ratingDistribution[5]}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sin responder</p>
              <p className="text-2xl font-bold text-gray-900">
                {reviews.filter(r => !r.response).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Rating distribution */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de calificaciones</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-16">
                <span className="text-sm font-medium text-gray-600">{rating}</span>
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ 
                    width: reviews.length > 0 
                      ? `${(ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100}%` 
                      : '0%' 
                  }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">
                {ratingDistribution[rating as keyof typeof ratingDistribution]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Todas las reseñas</h2>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filtrar</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Search className="w-4 h-4" />
                <span>Buscar</span>
              </button>
            </div>
          </div>
        </div>
        
        {reviews.length === 0 ? (
          <div className="p-12 text-center">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reseñas aún</h3>
            <p className="text-gray-600">Las reseñas aparecerán aquí cuando los usuarios califiquen tus artículos</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Reviewer avatar */}
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 font-medium text-sm">
                      {review.reviewer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Review content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{review.reviewer.name}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating 
                                    ? 'text-yellow-500 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Para: {review.item.title}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(new Date(review.createdAt))}
                      </span>
                    </div>

                    <p className="text-gray-900 mt-3">{review.comment}</p>

                    {/* Response */}
                    {review.response && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-blue-900">Tu respuesta:</span>
                        </div>
                        <p className="text-blue-800 text-sm">{review.response}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center space-x-3 mt-4">
                      {!review.response && (
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          Responder
                        </button>
                      )}
                      <button className="text-sm text-gray-600 hover:text-gray-800">
                        Ver artículo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

