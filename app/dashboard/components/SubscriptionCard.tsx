'use client'

import { Crown, BarChart3, ArrowRight } from 'lucide-react'
import { useSubscription } from '@/app/hooks/useSubscription'
import Card from '@/app/dashboard/components/Card'
import { useRouter } from 'next/navigation'

export default function SubscriptionCard() {
  const { subscription, usage, isLoading, isOnFreePlan, planSlug } = useSubscription()
  const router = useRouter()

  if (isLoading) return null

  const planName = subscription?.plan?.name || 'Free'

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            isOnFreePlan ? 'bg-neutral-100' : 'bg-primary-50'
          }`}>
            {isOnFreePlan ? (
              <BarChart3 className="w-4 h-4 text-neutral-500" />
            ) : (
              <Crown className="w-4 h-4 text-primary-600" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-900">Subscription</h3>
            <p className="text-xs text-neutral-500">{planName} Plan</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard/subscription')}
          className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          Manage <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Mini usage display */}
      {isOnFreePlan && usage && (
        <div className="space-y-2">
          {usage.limits.maxQuizzesPerWeek !== null && (
            <div>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="text-neutral-500">Quizzes this week</span>
                <span className="text-neutral-700">{usage.quizzesCreatedThisWeek}/{usage.limits.maxQuizzesPerWeek}</span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-400"
                  style={{ width: `${Math.min((usage.quizzesCreatedThisWeek / usage.limits.maxQuizzesPerWeek) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
          {usage.limits.maxFlashcardsTotal !== null && (
            <div>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="text-neutral-500">Flashcards total</span>
                <span className="text-neutral-700">{usage.flashcardsCreated}/{usage.limits.maxFlashcardsTotal}</span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-400"
                  style={{ width: `${Math.min((usage.flashcardsCreated / usage.limits.maxFlashcardsTotal) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
