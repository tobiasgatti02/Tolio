import Image from "next/image"
import { Star } from "lucide-react"

// In a real app, this would fetch from an API
const reviews = [
  {
    id: 1,
    user: {
      name: "Sarah L.",
      image: "/placeholder.svg?height=100&width=100",
    },
    rating: 5,
    date: "March 2023",
    comment:
      "Great drill set! Everything was in perfect condition and Michael was very helpful with instructions on how to use it. Would definitely borrow again.",
  },
  {
    id: 2,
    user: {
      name: "John D.",
      image: "/placeholder.svg?height=100&width=100",
    },
    rating: 4,
    date: "February 2023",
    comment:
      "The drill worked perfectly for my project. The owner was responsive and flexible with pickup times. Only giving 4 stars because one of the drill bits was missing.",
  },
  {
    id: 3,
    user: {
      name: "Emily R.",
      image: "/placeholder.svg?height=100&width=100",
    },
    rating: 5,
    date: "January 2023",
    comment:
      "Excellent experience! The drill was powerful and had a long battery life. The owner was very accommodating with pickup and return times.",
  },
]

interface ReviewListProps {
  itemId: string
}

export default function ReviewList({ itemId }: ReviewListProps) {
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-b-0">
          <div className="flex items-start">
            <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
              <Image
                src={review.user.image || "/placeholder.svg"}
                alt={review.user.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-medium">{review.user.name}</h4>
                <span className="text-sm text-gray-500">{review.date}</span>
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

