'use client'

// app/dashboard/support/page.tsx — Replaces the old subscription page.
// Shows fair-use usage, donation history, and a support CTA.

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, Gauge, Check, ExternalLink } from 'lucide-react'
import PageHeader from '@/app/dashboard/components/PageHeader'
import Card from '@/app/dashboard/components/Card'
import AnimatedSection from '@/app/dashboard/components/AnimatedSection'
import { ShimmerBlock } from '@/app/dashboard/components/Shimmer'
import { useSubscription } from '@/app/hooks/useSubscription'
import { getSessionToken } from '@/app/hooks/useSession'

interface Donation {
  id: string
  amountUSD: number
  status: string
  provider: string
  createdAt: string
  message: string | null
}

export default function SupportPage() {
  const { usage, isLoading } = useSubscription()
  const [donations, setDonations] = useState<Donation[] | null>(null)
  const [loadingDonations, setLoadingDonations] = useState(true)

  useEffect(() => {
    const fetchDonations = async () => {
      const token = getSessionToken()
      if (!token) {
        setLoadingDonations(false)
        return
      }
      try {
        // Lightweight endpoint: returns the current session's donations
        const res = await fetch('/api/donations/mine', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setDonations(data.donations)
        }
      } catch {
        // ignore — show empty state
      } finally {
        setLoadingDonations(false)
      }
    }
    fetchDonations()
  }, [])

  const completed = donations?.filter((d) => d.status === 'COMPLETED') ?? []
  const totalGiven = completed.reduce((sum, d) => sum + d.amountUSD, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AnimatedSection>
        <PageHeader
          title="Support Lernopia"
          subtitle="Lernopia is free for everyone — donations keep it that way"
          icon={Heart}
        />
      </AnimatedSection>

      {/* Donate CTA card */}
      <AnimatedSection delay={0.05}>
        <div className="bg-secondary-800 rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
            <div>
              <h2 className="text-xl font-fredoka font-bold text-white mb-1.5">
                Enjoying Lernopia?
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed max-w-md">
                Every donation — big or small — helps cover AI and hosting costs,
                keeping the platform free for students everywhere. One-time only, never recurring.
              </p>
            </div>
            <Link
              href="/donate"
              className="btn-primary flex-shrink-0 px-6 py-3 text-sm rounded-xl self-start sm:self-center"
            >
              <Heart className="w-4 h-4" />
              Make a donation
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* Fair-use usage */}
      <AnimatedSection delay={0.1}>
        <Card className="p-6">
          <h3 className="text-base font-heading font-semibold text-neutral-900 mb-1 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-neutral-400" />
            Fair-use usage
          </h3>
          <p className="text-xs text-neutral-400 mb-5">
            Generous caps that keep the service sustainable — most learners never reach them.
          </p>

          {isLoading || !usage ? (
            <div className="space-y-3">
              <ShimmerBlock className="h-14 rounded-xl" />
              <ShimmerBlock className="h-14 rounded-xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm text-neutral-600">Quizzes this week</span>
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
                      className="h-full rounded-full bg-primary-500"
                    />
                  </div>
                )}
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm text-neutral-600">Flashcards total</span>
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
                      className="h-full rounded-full bg-primary-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </AnimatedSection>

      {/* Donation history */}
      <AnimatedSection delay={0.15}>
        <Card className="p-6">
          <h3 className="text-base font-heading font-semibold text-neutral-900 mb-5">
            Your donations
          </h3>

          {loadingDonations ? (
            <div className="space-y-3">
              <ShimmerBlock className="h-12 rounded-xl" />
              <ShimmerBlock className="h-12 rounded-xl" />
            </div>
          ) : !donations || donations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-5 h-5 text-neutral-300" />
              </div>
              <p className="text-sm font-medium text-neutral-600 mb-0.5">No donations yet</p>
              <p className="text-xs text-neutral-400">
                That&apos;s completely fine — studying is always free.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {totalGiven > 0 && (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-success-50 border border-success-100 mb-1">
                  <span className="text-sm font-medium text-neutral-700">Total given</span>
                  <span className="text-sm font-bold text-success-700">${totalGiven.toFixed(2)}</span>
                </div>
              )}
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-100"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      donation.status === 'COMPLETED'
                        ? 'bg-success-50'
                        : donation.status === 'PENDING'
                        ? 'bg-warning-50'
                        : 'bg-neutral-100'
                    }`}>
                      {donation.status === 'COMPLETED' ? (
                        <Check className="w-4 h-4 text-success-600" />
                      ) : (
                        <Heart className={`w-4 h-4 ${
                          donation.status === 'PENDING' ? 'text-warning-500' : 'text-neutral-400'
                        }`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        ${donation.amountUSD.toFixed(2)}
                        {donation.message && (
                          <span className="ml-2 text-xs font-normal text-neutral-400">
                            “{donation.message.slice(0, 40)}{donation.message.length > 40 ? '…' : ''}”
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {new Date(donation.createdAt).toLocaleDateString()} · {donation.provider === 'PAYPAL' ? 'PayPal' : 'Mobile money'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                    donation.status === 'COMPLETED'
                      ? 'bg-success-50 text-success-700'
                      : donation.status === 'PENDING'
                      ? 'bg-warning-50 text-warning-700'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {donation.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </AnimatedSection>

      {/* Why donate */}
      <AnimatedSection delay={0.2}>
        <Card className="p-6">
          <h3 className="text-base font-heading font-semibold text-neutral-900 mb-4">
            Where your donation goes
          </h3>
          <ul className="space-y-3">
            {[
              'AI generation costs for quizzes and flashcards',
              'Servers and infrastructure to keep the app fast',
              'Keeping every feature free — forever',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-600">
                <Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/donate"
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-600"
          >
            Make a one-time donation <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </AnimatedSection>
    </div>
  )
}
