'use client'

export default function LoadingState() {
  return (
    <div className="min-h-screen py-8 bg-[#ececec]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-7 w-32 bg-neutral-200 rounded-lg mb-2 animate-pulse" />
          <div className="h-4 w-48 bg-neutral-200 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column Skeleton */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-neutral-200 rounded-xl animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-32 bg-neutral-200 rounded-lg animate-pulse" />
                  <div className="h-4 w-40 bg-neutral-200 rounded-lg animate-pulse" />
                  <div className="h-3 w-20 bg-neutral-200 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-neutral-100 space-y-2">
                <div className="h-9 w-full bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-9 w-full bg-neutral-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Skeleton */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="h-5 w-36 bg-neutral-200 rounded-lg mb-4 animate-pulse" />
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl p-4 bg-neutral-100">
                    <div className="h-7 w-12 bg-neutral-200 rounded-lg mb-2 animate-pulse" />
                    <div className="h-3 w-16 bg-neutral-200 rounded-lg animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-neutral-100">
                <div className="flex justify-between items-center mb-3">
                  <div className="h-4 w-24 bg-neutral-200 rounded-lg animate-pulse" />
                  <div className="h-3 w-16 bg-neutral-200 rounded-lg animate-pulse" />
                </div>
                <div className="flex items-end justify-between h-20 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full max-w-[28px] bg-neutral-200 rounded-lg animate-pulse" style={{ height: `${15 + Math.random() * 50}px` }} />
                      <div className="h-2 w-3 bg-neutral-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings Skeleton */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="h-5 w-36 bg-neutral-200 rounded-lg mb-4 animate-pulse" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="space-y-1.5">
                      <div className="h-4 w-28 bg-neutral-200 rounded-lg animate-pulse" />
                      <div className="h-3 w-40 bg-neutral-200 rounded-lg animate-pulse" />
                    </div>
                    <div className="h-6 w-11 bg-neutral-200 rounded-full animate-pulse" />
                  </div>
                ))}
                <div className="pt-4 border-t border-neutral-100 space-y-2">
                  <div className="h-9 w-full bg-neutral-200 rounded-lg animate-pulse" />
                  <div className="h-9 w-full bg-neutral-200 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>

            {/* Activity Skeleton */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="h-5 w-36 bg-neutral-200 rounded-lg mb-4 animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-9 h-9 bg-neutral-200 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-36 bg-neutral-200 rounded-lg animate-pulse" />
                      <div className="h-3 w-24 bg-neutral-200 rounded-lg animate-pulse" />
                    </div>
                    <div className="h-3 w-12 bg-neutral-200 rounded-lg animate-pulse" />
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
