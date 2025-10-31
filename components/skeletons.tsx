// Skeletons personalizados para cada sección

export function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 animate-pulse">
          {/* Logo */}
          <div className="h-10 w-32 bg-gray-200 rounded-lg mx-auto" />
          
          {/* Title */}
          <div className="h-8 w-3/4 bg-gray-200 rounded-lg mx-auto" />
          
          {/* Form fields */}
          <div className="space-y-4">
            <div className="h-12 bg-gray-100 rounded-lg" />
            <div className="h-12 bg-gray-100 rounded-lg" />
          </div>
          
          {/* Button */}
          <div className="h-12 bg-gradient-to-r from-orange-200 to-red-200 rounded-lg" />
          
          {/* Link */}
          <div className="h-4 w-2/3 bg-gray-200 rounded mx-auto" />
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded-lg" />
          <div className="h-4 w-48 bg-gray-100 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-orange-100 rounded-lg" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-orange-100 rounded-full" />
              <div className="h-6 w-16 bg-green-100 rounded-full" />
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
          <div className="h-64 bg-gradient-to-t from-gray-100 to-transparent rounded" />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ItemsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
          {/* Image */}
          <div className="h-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
          
          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="h-3 w-20 bg-orange-100 rounded-full" />
            <div className="h-5 w-full bg-gray-200 rounded" />
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
            
            <div className="flex items-center justify-between pt-2">
              <div className="h-6 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-100 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ItemDetailSkeleton() {
  return (
    <div className="container mx-auto p-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="h-96 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-2xl" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
        
        {/* Info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-3 w-24 bg-orange-100 rounded-full" />
            <div className="h-10 w-full bg-gray-200 rounded-lg" />
            <div className="h-6 w-32 bg-gray-100 rounded" />
          </div>
          
          <div className="h-px bg-gray-200" />
          
          <div className="space-y-3">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-100 rounded-lg" />
          </div>
          
          <div className="h-px bg-gray-200" />
          
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-48 bg-gray-100 rounded" />
            </div>
          </div>
          
          <div className="h-14 bg-gradient-to-r from-orange-200 to-red-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="container mx-auto p-6 max-w-4xl animate-pulse">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-center space-x-6">
          <div className="h-24 w-24 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-64 bg-gray-200 rounded-lg" />
            <div className="h-4 w-48 bg-gray-100 rounded" />
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 w-20 bg-orange-100 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 w-32 bg-gray-100 rounded-lg" />
        ))}
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="h-40 bg-gray-200 rounded-lg mb-4" />
            <div className="space-y-2">
              <div className="h-5 w-full bg-gray-200 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BookingSkeleton() {
  return (
    <div className="container mx-auto p-6 max-w-2xl animate-pulse">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-gray-100 rounded" />
              <div className="h-12 bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
        
        <div className="h-px bg-gray-200" />
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-5 w-32 bg-gray-100 rounded" />
            <div className="h-5 w-24 bg-gray-200 rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-5 w-40 bg-gray-100 rounded" />
            <div className="h-5 w-24 bg-gray-200 rounded" />
          </div>
          <div className="flex justify-between pt-2 border-t">
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="h-6 w-32 bg-orange-200 rounded" />
          </div>
        </div>
        
        <div className="h-14 bg-gradient-to-r from-orange-200 to-red-200 rounded-xl" />
      </div>
    </div>
  )
}
