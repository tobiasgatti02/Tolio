import Image from "next/image"
import { Star } from "lucide-react"
import { getReviewsByItemId } from "@/app/api/items/[itemId]/reviews/route" // We'll create this function

interface ReviewProps {
  itemId: string
}

export default async function ReviewList({ itemId }: ReviewProps) {
  const reviews = await getReviewsByItemId(itemId)
  
  if (!reviews?.length) {
    return <div className="text-center py-4">No reviews yet</div>
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-b-0">
          <div className="flex items-start">
            <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
              <Image
                src={review.reviewer.profileImage || "/placeholder.svg"}
                alt={`${review.reviewer.firstName} ${review.reviewer.lastName}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-medium">
                  {review.reviewer.firstName} {review.reviewer.lastName.charAt(0)}.
                </h4>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}