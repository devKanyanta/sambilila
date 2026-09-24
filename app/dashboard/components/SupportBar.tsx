'use client'

// SupportBar — replaces the old SubscriptionBar
// Shows a gentle fair-use indicator (no plan upsell) and a donate CTA.

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Heart, Gauge } from 'lucide-react'
import { useSubscription } from '@/app/hooks/useSubscription'

export default function SupportBar() {
  const { usage, isLoading } = useSubscription()
  const router = useRouter()

  // Keep the bar invisible until usage data is ready to avoid layout jumps
  if (isLoading || !usage) return null

  const limits = usage.limits

  // Compute the most-constrained usage percentage
  let usagePercent = 0
  const parts: string[] = []

  if (limits.maxQuizzesPerWeek !== null && usage) {
    const quizPercent = (usage.quizzesCreatedThisWeek / limits.maxQuizzesPerWeek) * 100
    usagePercent = Math.max(usagePercent, quizPercent)
    parts.push(`${usage.quizzesCreatedThisWeek}/${limits.maxQuizzesPerWeek} quizzes this week`)
  }

  if (limits.maxFlashcardsTotal !== null && usage) {
    const cardPercent = (usage.flashcardsCreated / limits.maxFlashcardsTotal) * 100
    usagePercent = Math.max(usagePercent, cardPercent)
    parts.push(`${usage.flashcardsCreated}/${limits.maxFlashcardsTotal} cards`)
  }

  const usageLabel = parts.join(' · ')
  const isNearLimit = usagePercent >= 80 && usagePercent < 100
  const isAtLimit = usagePercent >= 100

  // Only show the bar when usage becomes meaningful (>= 40%) or at/near limit
  if (usagePercent < 40 && !isAtLimit) return null

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-white border-b border-neutral-200/80 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between py-2.5 gap-4">
          {/* Fair-use indicator */}
          <div className="flex-1 max-w-md flex items-center gap-3 min-w-0">
            <Gauge className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  isAtLimit ? 'bg-primary-500' : isNearLimit ? 'bg-warning-400' : 'bg-neutral-400'
                }`}
              />
            </div>
            <span className={`text-xs whitespace-nowrap ${
              isAtLimit ? 'text-primary-600 font-semibold' : 'text-neutral-400'
            }`}>
              {usageLabel}
            </span>
          </div>

          {/* Donate CTA — stronger when close to limit */}
          <button
            onClick={() => router.push('/donate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 whitespace-nowrap ${
              isAtLimit || isNearLimit
                ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Heart className={`w-3 h-3 ${isAtLimit || isNearLimit ? 'text-white' : 'text-primary-500'}`} />
            <span>{isAtLimit ? 'Fair use reached — support us' : 'Support Lernopia'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
