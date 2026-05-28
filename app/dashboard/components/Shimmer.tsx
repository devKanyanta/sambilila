'use client'

import { ReactNode } from 'react'

/* ─── Base Shimmer Block ─── */
export function ShimmerBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`shimmer rounded-xl ${className}`}
      aria-hidden="true"
    />
  )
}

/* ─── Shimmer Text Lines ─── */
export function ShimmerText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerBlock
          key={i}
          className={`h-3 ${i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

/* ─── Shimmer Heading + Subtitle ─── */
export function ShimmerHeading({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`} aria-hidden="true">
      <ShimmerBlock className="w-12 h-12 rounded-2xl" />
      <div className="space-y-2 flex-1">
        <ShimmerBlock className="h-6 w-48" />
        <ShimmerBlock className="h-3 w-32" />
      </div>
    </div>
  )
}

/* ─── Shimmer Stat Block ─── */
export function ShimmerStatBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 ${className}`} aria-hidden="true">
      <div className="flex items-center gap-3">
        <ShimmerBlock className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <ShimmerBlock className="h-7 w-16" />
          <ShimmerBlock className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}

/* ─── Shimmer Card (mimics a grid card) ─── */
export function ShimmerCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 ${className}`} aria-hidden="true">
      <div className="flex items-start justify-between mb-3">
        <ShimmerBlock className="h-5 w-3/4" />
        <ShimmerBlock className="w-4 h-4 rounded-sm" />
      </div>
      <ShimmerBlock className="h-5 w-20 rounded-full mb-3" />
      <ShimmerText lines={2} className="mb-4" />
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <ShimmerBlock className="h-3 w-16" />
        <ShimmerBlock className="h-3 w-12" />
      </div>
    </div>
  )
}

/* ─── Shimmer Activity Row ─── */
export function ShimmerActivityRow({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 ${className}`} aria-hidden="true">
      <ShimmerBlock className="w-9 h-9 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <ShimmerBlock className="h-4 w-40" />
        <ShimmerBlock className="h-3 w-28" />
      </div>
      <ShimmerBlock className="h-3 w-12 flex-shrink-0" />
    </div>
  )
}

/* ─── Full-page Shimmer Wrapper ─── */
export function ShimmerPage({ children, count = 1, className = '' }: { children: ReactNode; count?: number; className?: string }) {
  return (
    <div className={`space-y-6 ${className}`} role="status" aria-label="Loading">
      {children}
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerBlock key={i} className="h-4 w-full" />
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  )
}
