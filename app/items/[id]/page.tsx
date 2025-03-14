import Link from "next/link"
import { MapPin, Star, ArrowLeft } from "lucide-react"
import ItemGallery from "@/components/item-gallery"
import OwnerProfile from "@/components/owner-profile"
import BookingForm from "@/components/booking-form"
import ReviewList from "@/components/review-list"
import { getItemById } from "@/app/api/items/[itemId]/items/route"
import { Suspense } from "react"
import ReviewListSkeleton from "@/components/review-list-skeleton" // new

export default async function ItemPage({ params }: { params: { id: string } }) {
  const items = await getItemById(params.id)
  const item = Array.isArray(items) && items.length > 0 ? items[0] : null
  
  if (!item) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Item not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="flex items-center text-emerald-600 mb-6 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ItemGallery images={item.images} />

          <div className="mt-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center mr-4">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="ml-1 font-medium">
                  {item.reviews.length > 0 
                    ? (item.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / item.reviews.length).toFixed(1)
                    : "N/A"}
                </span>
                <span className="ml-1 text-gray-500">({item.reviews.length} reviews)</span>
              </div>
              <div className="flex items-center text-gray-500">
                <MapPin className="h-5 w-5 mr-1" />
                {item.location}
              </div>
            </div>

            <div className="border-t border-b py-4 my-4">
              <h2 className="text-xl font-bold mb-4">Descripción</h2>
              <p className="text-gray-700">{item.description}</p>
            </div>

            <div className="py-4 my-4">
              <h2 className="text-xl font-bold mb-4">Características</h2>
              <ul className="grid grid-cols-2 gap-2">
                {item.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="py-4 my-4">
              <h2 className="text-xl font-bold mb-4">Reviews</h2>
              <Suspense fallback={<ReviewListSkeleton />}>
                <ReviewList itemId={params.id} />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <div className="mb-4">
              <div className="text-2xl font-bold text-gray-900">
                ${item.price}
                <span className="text-gray-500 font-normal text-base">/día</span>
              </div>
              <div className="text-sm text-gray-500">${item.deposit} depósito de seguridad</div>
            </div>

            <BookingForm itemId={params.id} price={item.price} />

            <div className="border-t mt-6 pt-6">
              <OwnerProfile owner={{
                id: item.owner.id,
                name: `${item.owner.firstName} ${item.owner.lastName}`,
                image: item.owner.profileImage || '',
                rating: item.owner.reviews && item.owner.reviews.length > 0
                  ? item.owner.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / item.owner.reviews.length
                  : 0,
                reviews: item.owner.reviews ? item.owner.reviews.length : 0,
                memberSince: item.owner.createdAt,
                responseRate: 0
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}