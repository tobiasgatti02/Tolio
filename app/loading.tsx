"use client"

import FeaturedItemsSkeleton from "@/components/featured-items-skeleton"
// Import other skeleton components if needed (e.g., HeroSearchSkeleton, CategoryListSkeleton)

export default function HomeLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative bg-gradient-to-r from-emerald-600 to-teal-500 py-20 px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="max-w-5xl mx-auto text-center">
          <div className="h-12 bg-gray-300 rounded w-3/4 mx-auto mb-6" />
          <div className="h-10 bg-gray-300 rounded w-1/2 mx-auto mb-8" />
          {/* Optionally, include a HeroSearchSkeleton */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded" />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section Skeleton */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 animate-pulse">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-8" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded" />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items Section Skeleton */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 bg-gray-300 rounded w-1/3" />
            <div className="h-8 bg-gray-300 rounded w-1/6" />
          </div>
          <FeaturedItemsSkeleton />
        </div>
      </section>

      {/* How It Works and CTA Sections Skeleton */}
      {/* Add additional sections as desired */}
    </div>
  )
}