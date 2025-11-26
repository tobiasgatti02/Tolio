import Image from "next/image"
import { Star, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface ReviewProps {
  itemId: string
}

async function getReviewsByItemId(itemId: string) {
  const reviews = await prisma.review.findMany({
    where: { itemId },
    include: {
      reviewer: {
        select: {
          firstName: true,
          lastName: true,
          profileImage: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  return reviews
}

export default async function ReviewList({ itemId }: ReviewProps) {
  const reviews = await getReviewsByItemId(itemId)
  
  if (!reviews?.length) {
    return (
      <div className="text-center py-8">
        <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sin reseñas aún</h3>
        <p className="text-gray-600">Sé el primero en dejar una reseña para este artículo</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
              {review.reviewer.profileImage ? (
                <Image
                  src={review.reviewer.profileImage}
                  alt={`${review.reviewer.firstName} ${review.reviewer.lastName}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-600 font-medium text-lg">
                    {review.reviewer.firstName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {review.reviewer.firstName} {review.reviewer.lastName.charAt(0)}.
                  </h4>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating 
                            ? "text-yellow-500 fill-yellow-500" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {review.rating}/5
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>
              
              <p className="text-gray-800 leading-relaxed mb-3">{review.comment}</p>
              
              {/* Respuesta del propietario */}
              {review.response && (
                <div className="mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-200 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">Respuesta del propietario</span>
                  </div>
                  <p className="text-emerald-700 text-sm leading-relaxed">{review.response}</p>
                  {review.responseDate && (
                    <p className="text-xs text-emerald-600 mt-2">
                      {format(new Date(review.responseDate), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}