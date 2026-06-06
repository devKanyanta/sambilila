'use client'

import { useSubscription } from '@/app/hooks/useSubscription'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Sparkles, Crown, BarChart3, Layers } from 'lucide-react'

export default function SubscriptionBar() {
  const { subscription, usage, plans, isLoading, isOnFreePlan, planSlug } = useSubscription()
  const router = useRouter()

  // Don't show if loading or no token
  if (isLoading) {
    return null
  }

  const planName = subscription?.plan?.name || 'Free'
  const isFree = isOnFreePlan
  const limits = usage?.limits

  // Calculate usage percentage for the most restrictive limit
  let usagePercent = 0
  let usageLabel = ''

  if (isFree && limits) {
    if (limits.maxQuizzesPerWeek && usage) {
      const quizPercent = (usage.quizzesCreatedThisWeek / limits.maxQuizzesPerWeek) * 100
      usagePercent = Math.max(usagePercent, quizPercent)
      usageLabel = `${usage.quizzesCreatedThisWeek}/${limits.maxQuizzesPerWeek} quizzes`
    }
  }

  if (isFree && limits?.maxFlashcardsTotal && usage) {
    const cardPercent = (usage.flashcardsCreated / limits.maxFlashcardsTotal) * 100
    usagePercent = Math.max(usagePercent, cardPercent)
    if (usageLabel) {
      usageLabel += ` · ${usage.flashcardsCreated}/${limits.maxFlashcardsTotal} cards`
    } else {
      usageLabel = `${usage.flashcardsCreated}/${limits.maxFlashcardsTotal} cards`
    }
  }

  const isNearLimit = usagePercent >= 80 && usagePercent < 100
  const isAtLimit = usagePercent >= 100

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-white border-b border-neutral-100 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between py-2.5 gap-4">
          {/* Plan badge */}
          <button
            onClick={() => router.push('/dashboard/subscription')}
            className="flex items-center gap-2 group"
          >
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              isFree
                ? 'bg-neutral-100 text-neutral-600'
                : 'bg-primary-50 text-primary-700'
            }`}>
              {isFree ? (
                <BarChart3 className="w-3 h-3" />
              ) : (
                <Crown className="w-3 h-3" />
              )}
              <span>{planName}</span>
            </div>
          </button>

          {/* Usage bar */}
          {isFree && usageLabel && (
            <div className="flex-1 max-w-md hidden sm:flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full transition-colors ${
                    isAtLimit
                      ? 'bg-red-400'
                      : isNearLimit
                      ? 'bg-amber-400'
                      : 'bg-primary-400'
                  }`}
                />
              </div>
              <span className={`text-xs whitespace-nowrap ${
                isAtLimit
                  ? 'text-red-500 font-medium'
                  : isNearLimit
                  ? 'text-amber-600'
                  : 'text-neutral-400'
              }`}>
                {usageLabel}
              </span>
            </div>
          )}

          {/* Upgrade CTA */}
          <button
            onClick={() => router.push('/dashboard/subscription')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 whitespace-nowrap ${
              isAtLimit
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : isFree
                ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
                : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{isFree ? 'Upgrade' : 'Manage'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
