'use client'

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column Skeleton */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="h-9 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-9 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Card Skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-lg p-4 bg-gray-100">
                    <div className="h-8 w-16 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-end justify-between h-24">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="w-8 bg-gray-200 rounded-t animate-pulse" style={{ height: `${20 + Math.random() * 60}%` }}></div>
                      <div className="h-3 w-4 bg-gray-200 rounded mt-2 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings Card Skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-11 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="h-9 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-9 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Activity Card Skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3 p-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}