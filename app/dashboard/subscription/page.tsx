'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSubscription } from '@/app/hooks/useSubscription'
import PageHeader from '@/app/dashboard/components/PageHeader'
import Card from '@/app/dashboard/components/Card'
import UpgradeModal from '@/app/dashboard/components/UpgradeModal'
import AnimatedSection from '@/app/dashboard/components/AnimatedSection'
import { ShimmerBlock, ShimmerStatBlock } from '@/app/dashboard/components/Shimmer'
import { Crown, BarChart3, Check, X as XIcon, Calendar, CreditCard, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react'

export default function SubscriptionPage() {
  const {
    subscription,
    usage,
    plans,
    isLoading,
    isOnFreePlan,
    planSlug,
    cancel,
    refresh,
  } = useSubscription()

  const [showUpgrade, setShowUpgrade] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <ShimmerBlock className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5 flex-1">
            <ShimmerBlock className="h-6 w-36" />
            <ShimmerBlock className="h-3 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ShimmerBlock className="h-48 rounded-xl" />
          <ShimmerBlock className="h-48 rounded-xl" />
        </div>
      </div>
    )
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await cancel()
      setCancelConfirm(false)
    } catch (err) {
      console.error('Cancel error:', err)
    } finally {
      setCancelling(false)
    }
  }

  const currentPlan = plans.find(p => p.slug === planSlug)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AnimatedSection>
        <PageHeader
          title="Subscription"
          subtitle="Manage your plan and billing"
          icon={Crown}
          action={
            isOnFreePlan ? (
              <button
                onClick={() => setShowUpgrade(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-primary-500 hover:bg-primary-600 transition-all shadow-sm active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade
              </button>
            ) : null
          }
        />
      </AnimatedSection>

      {/* Current Plan Card */}
      <AnimatedSection delay={0.05}>
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isOnFreePlan ? 'bg-neutral-100' : 'bg-primary-50'
              }`}>
                {isOnFreePlan ? (
                  <BarChart3 className="w-6 h-6 text-neutral-500" />
                ) : (
                  <Crown className="w-6 h-6 text-primary-600" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-heading font-semibold text-neutral-900">
                  {currentPlan?.name || 'Free'} Plan
                </h2>
                <p className="text-sm text-neutral-500">
                  {isOnFreePlan
                    ? 'Free tier with limited features'
                    : `${currentPlan && 'priceUSD' in currentPlan ? `$${currentPlan.priceUSD}/${currentPlan.period}` : ''}`
                  }
                </p>
              </div>
            </div>
            {subscription?.status && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                subscription.status === 'ACTIVE'
                  ? 'bg-green-50 text-green-600'
                  : subscription.status === 'CANCELED'
                  ? 'bg-neutral-100 text-neutral-500'
                  : 'bg-amber-50 text-amber-600'
              }`}>
                {subscription.status}
              </span>
            )}
          </div>

          {/* Plan Features */}
          {currentPlan && (
            <div className="border-t border-neutral-100 pt-4 mt-4">
              <p className="text-sm font-medium text-neutral-700 mb-3">What&apos;s included:</p>
              <ul className="space-y-2">
                {currentPlan.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2.5 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Subscription details */}
          {subscription && (
            <div className="border-t border-neutral-100 pt-4 mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Status</span>
                <span className="font-medium text-neutral-700 capitalize">{subscription.status.toLowerCase()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Provider</span>
                <span className="font-medium text-neutral-700">{subscription.provider}</span>
              </div>
              {subscription.currentPeriodEnd && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Next billing</span>
                  <span className="font-medium text-neutral-700">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {!isOnFreePlan && (
            <div className="border-t border-neutral-100 pt-4 mt-4">
              {cancelConfirm ? (
                <div className="space-y-3">
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-xl">
                    Are you sure? Your access will continue until the end of the billing period, then you&apos;ll be downgraded to the Free plan.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex-1 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50"
                    >
                      {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                    </button>
                    <button
                      onClick={() => setCancelConfirm(false)}
                      className="flex-1 py-2 rounded-xl text-sm font-medium text-neutral-600 border border-neutral-200 hover:bg-neutral-50 transition-all"
                    >
                      Keep Plan
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setCancelConfirm(true)}
                  className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  Cancel subscription
                </button>
              )}
            </div>
          )}
        </Card>
      </AnimatedSection>

      {/* Usage Stats */}
      {usage && (
        <AnimatedSection delay={0.1}>
          <Card className="p-6">
            <h3 className="text-base font-heading font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-neutral-400" />
              Usage This Period
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Quizzes Created</span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {usage.quizzesCreatedThisWeek}
                    {usage.limits.maxQuizzesPerWeek !== null && ` / ${usage.limits.maxQuizzesPerWeek}`}
                  </span>
                </div>
                {usage.limits.maxQuizzesPerWeek !== null && (
                  <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((usage.quizzesCreatedThisWeek / usage.limits.maxQuizzesPerWeek) * 100, 100)}%` }}
                      className="h-full rounded-full bg-primary-400"
                    />
                  </div>
                )}
              </div>
              <div className="p-4 rounded-xl bg-neutral-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Flashcards Created</span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {usage.flashcardsCreated}
                    {usage.limits.maxFlashcardsTotal !== null && ` / ${usage.limits.maxFlashcardsTotal}`}
                  </span>
                </div>
                {usage.limits.maxFlashcardsTotal !== null && (
                  <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((usage.flashcardsCreated / usage.limits.maxFlashcardsTotal) * 100, 100)}%` }}
                      className="h-full rounded-full bg-primary-400"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </AnimatedSection>
      )}

      {/* Plan Comparison */}
      <AnimatedSection delay={0.15}>
        <Card className="p-6">
          <h3 className="text-base font-heading font-medium text-neutral-900 mb-4">Compare Plans</h3>
          <div className="space-y-3">
            {plans.map((plan) => (
              <motion.div
                key={plan.slug}
                whileHover={{ scale: 1.01 }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  planSlug === plan.slug
                    ? 'border-primary-500 bg-primary-50/30'
                    : 'border-neutral-100 hover:border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-heading font-semibold text-neutral-900">{plan.name}</h4>
                    <p className="text-xs text-neutral-500">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    {plan.priceUSD > 0 ? (
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-bold text-neutral-900">${plan.priceUSD}</span>
                        <span className="text-xs text-neutral-400">/{plan.period}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-neutral-900">Free</span>
                    )}
                  </div>
                </div>
                {plan.slug !== planSlug && plan.priceUSD > 0 && (
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    Upgrade <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      </AnimatedSection>

      {/* Upgrade Modal */}
      <UpgradeModal show={showUpgrade} onClose={() => { setShowUpgrade(false); refresh() }} />
    </div>
  )
}
