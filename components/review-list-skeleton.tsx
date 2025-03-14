"use client"

export default function ReviewListSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="border-b pb-6 last:border-b-0">
          <div className="flex items-start">
            <div className="bg-gray-300 rounded-full h-10 w-10 mr-3" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <div className="bg-gray-300 rounded w-24 h-4" />
                <div className="bg-gray-300 rounded w-16 h-3" />
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-gray-300 rounded h-4 w-4" />
                ))}
              </div>
              <div className="bg-gray-300 rounded w-full h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}