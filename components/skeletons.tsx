export function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-blue-100 rounded-full w-20" />
          <div className="h-6 bg-gray-100 rounded-full w-16" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-8 bg-gradient-to-r from-blue-200 to-blue-100 rounded-lg w-24" />
          <div className="h-5 bg-yellow-100 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

export function ServiceListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ItemCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-emerald-200" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-4/5" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-emerald-100 rounded-full w-24" />
          <div className="h-6 bg-gray-100 rounded-full w-20" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-8 bg-gradient-to-r from-emerald-200 to-emerald-100 rounded-lg w-28" />
          <div className="h-5 bg-gray-100 rounded w-24" />
        </div>
      </div>
    </div>
  )
}

export function ItemListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DashboardCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-gray-200 rounded w-32" />
        <div className="h-10 w-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl" />
      </div>
      <div className="h-10 bg-gray-300 rounded-lg w-24 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-40" />
    </div>
  )
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="h-6 bg-blue-100 rounded-full w-20" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-100 rounded w-32" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-100 rounded w-40" />
        </div>
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        <div className="h-9 bg-gray-200 rounded-lg flex-1" />
        <div className="h-9 bg-blue-200 rounded-lg flex-1" />
      </div>
    </div>
  )
}

export function BookingListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <BookingCardSkeleton key={i} />
      ))}
    </div>
  )
}
