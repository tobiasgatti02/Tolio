"use client"

import { Skeleton } from "./ui/skeleton"

export default function FeaturedItemsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
          <div className="relative h-48 w-full">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="p-4 space-y-2">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-10 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}