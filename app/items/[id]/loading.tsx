import ReviewListSkeleton from "@/components/review-list-skeleton"

export default function ItemPageLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section Skeleton */}
      <div className="mb-6">
        <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mb-2" />
        <div className="h-8 w-64 bg-gray-300 rounded animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          {/* Item Gallery Skeleton */}
          <div className="relative h-[400px] w-full bg-gray-300 rounded-xl animate-pulse" />
          
          {/* Title and Details Skeleton */}
          <div className="space-y-2">
            <div className="h-6 w-1/2 bg-gray-300 rounded animate-pulse" />
            <div className="flex space-x-4">
              <div className="h-4 w-12 bg-gray-300 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
            </div>
          </div>
          
          {/* Description Skeleton */}
          <div className="border-t border-b py-4">
            <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mb-2" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-300 rounded animate-pulse" />
              <div className="h-4 w-11/12 bg-gray-300 rounded animate-pulse" />
              <div className="h-4 w-10/12 bg-gray-300 rounded animate-pulse" />
            </div>
          </div>
          
          {/* Features Skeleton */}
          <div className="py-4">
            <div className="h-6 w-24 bg-gray-300 rounded animate-pulse mb-2" />
            <ul className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <li key={idx} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
              ))}
            </ul>
          </div>
          
          {/* Reviews Skeleton */}
          <div className="py-4">
            <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mb-2" />
            <ReviewListSkeleton />
          </div>
        </div>
        
        {/* Right Column Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24 space-y-4">
            {/* Pricing Skeleton */}
            <div>
              <div className="h-8 w-24 bg-gray-300 rounded animate-pulse mb-2" />
              <div className="h-4 w-32 bg-gray-300 rounded animate-pulse" />
            </div>
            
            {/* Booking Form Skeleton */}
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-10 bg-gray-300 rounded animate-pulse" />
              ))}
            </div>
            
            {/* Owner Profile Skeleton */}
            <div className="mt-6">
              <div className="h-6 w-20 bg-gray-300 rounded animate-pulse mb-2" />
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gray-300 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}