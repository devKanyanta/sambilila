'use client'

import { ShimmerBlock } from '@/app/dashboard/components/Shimmer'

export default function LoadingState() {
  return (
    <div className="min-h-screen" role="status" aria-label="Loading profile">
      <div className="max-w-5xl mx-auto">
        {/* Header Shimmer */}
        <div className="flex items-center gap-4 mb-8">
          <ShimmerBlock className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <ShimmerBlock className="h-7 w-40" />
            <ShimmerBlock className="h-4 w-56" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column Shimmer */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col items-center">
                <ShimmerBlock className="w-20 h-20 rounded-2xl mb-4" />
                <ShimmerBlock className="h-5 w-28 mb-2" />
                <ShimmerBlock className="h-3 w-20 mb-4" />
                <ShimmerBlock className="h-4 w-44 mb-1" />
                <ShimmerBlock className="h-3 w-28" />
              </div>
              <div className="mt-6 pt-5 border-t border-neutral-100 space-y-2">
                <ShimmerBlock className="h-10 w-full rounded-xl" />
                <ShimmerBlock className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>

          {/* Right Column Shimmer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Card Shimmer */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <ShimmerBlock className="h-5 w-36 mb-5" />
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl p-4 bg-neutral-50">
                    <ShimmerBlock className="h-7 w-14 mb-2" />
                    <ShimmerBlock className="h-3 w-20" />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-3">
                  <ShimmerBlock className="h-4 w-28" />
                  <ShimmerBlock className="h-3 w-16" />
                </div>
                <div className="flex items-end justify-between h-20 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="shimmer w-full max-w-[28px] rounded-lg" style={{ height: `${Math.floor(15 + Math.random() * 50)}px` }} />
                      <ShimmerBlock className="h-2 w-3 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Card Shimmer */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <ShimmerBlock className="h-5 w-36 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2.5">
                    <div className="space-y-1.5">
                      <ShimmerBlock className="h-4 w-32" />
                      <ShimmerBlock className="h-3 w-24" />
                    </div>
                    <ShimmerBlock className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </div>

            {/* Settings Card Shimmer */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <ShimmerBlock className="h-5 w-36 mb-5" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="space-y-1.5">
                      <ShimmerBlock className="h-4 w-28" />
                      <ShimmerBlock className="h-3 w-40" />
                    </div>
                    <ShimmerBlock className="h-6 w-11 rounded-full" />
                  </div>
                ))}
                <div className="pt-4 border-t border-neutral-100 space-y-2">
                  <ShimmerBlock className="h-10 w-full rounded-xl" />
                  <ShimmerBlock className="h-10 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading profile...</span>
    </div>
  )
}
