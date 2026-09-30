'use client'

// app/dashboard/admin/feedback/AdminFeedbackContent.tsx
// Moderation queue for landing-page testimonials/feedback.

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquareHeart, RefreshCw, Check, X, Star, Trash2, Loader2 } from 'lucide-react'
import PageHeader from '@/app/dashboard/components/PageHeader'
import AnimatedSection from '@/app/dashboard/components/AnimatedSection'
import { containerStaggerSlow, fadeSlideUp } from '@/app/dashboard/animations'

interface FeedbackItem {
  id: string
  userId: string | null
  name: string
  email: string | null
  role: string | null
  rating: number | null
  message: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  featured: boolean
  createdAt: string
  reviewedAt: string | null
}

interface Counts {
  all: number
  pending: number
  approved: number
  rejected: number
}

const TABS = [
  { key: '', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
] as const

const STATUS_STYLES: Record<FeedbackItem['status'], string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-neutral-100 text-neutral-500 border-neutral-200',
}

export default function AdminFeedbackContent() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [counts, setCounts] = useState<Counts | null>(null)
  const [tab, setTab] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async (statusFilter: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `/api/admin/feedback${statusFilter ? `?status=${statusFilter}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      if (res.ok) {
        setItems(data.feedback)
        setCounts(data.counts)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(tab)
  }, [tab, load])

  const patch = async (id: string, data: { status?: string; featured?: boolean }) => {
    setBusyId(id)
    try {
      const token = localStorage.getItem('token')
      await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...data }),
      })
      await load(tab)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id: string) => {
    setBusyId(id)
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/admin/feedback?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      await load(tab)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerStaggerSlow}
      className="space-y-6"
    >
      <AnimatedSection>
        <PageHeader
          title="Feedback"
          subtitle="Moderate testimonials shown on the landing page"
          icon={MessageSquareHeart}
          action={
            <button
              onClick={() => load(tab)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-neutral-500 bg-white border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-700 transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          }
        />
      </AnimatedSection>

      {/* Tabs */}
      <AnimatedSection delay={0.05}>
        <div className="flex items-center gap-2 flex-wrap">
          {TABS.map(({ key, label }) => {
            const count = counts
              ? key === ''
                ? counts.all
                : key === 'PENDING'
                  ? counts.pending
                  : key === 'APPROVED'
                    ? counts.approved
                    : counts.rejected
              : null
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  tab === key
                    ? 'bg-secondary-800 text-white border-secondary-800'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {label}
                {count !== null && (
                  <span className="ml-1.5 text-xs opacity-70">{count}</span>
                )}
              </button>
            )
          })}
        </div>
      </AnimatedSection>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-neutral-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-sm text-neutral-400">
          No feedback here yet.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              variants={fadeSlideUp}
              className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-semibold text-neutral-900">{item.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full border text-xs font-medium ${STATUS_STYLES[item.status]}`}
                    >
                      {item.status}
                    </span>
                    {item.featured && (
                      <span className="px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200 text-xs font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {item.role && <>{item.role} · </>}
                    {item.email && <>{item.email} · </>}
                    {new Date(item.createdAt).toLocaleDateString()}
                    {item.userId ? ' · linked user' : ' · anonymous'}
                  </p>
                </div>
                {item.rating && (
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= item.rating!
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <p className="text-sm text-neutral-700 leading-relaxed mt-4">
                {item.message}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-neutral-100">
                {item.status !== 'APPROVED' && (
                  <button
                    onClick={() => patch(item.id, { status: 'APPROVED' })}
                    disabled={busyId === item.id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                )}
                {item.status !== 'REJECTED' && (
                  <button
                    onClick={() => patch(item.id, { status: 'REJECTED' })}
                    disabled={busyId === item.id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 disabled:opacity-60 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                )}
                <button
                  onClick={() => patch(item.id, { featured: !item.featured })}
                  disabled={busyId === item.id}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-60 ${
                    item.featured
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${item.featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                  {item.featured ? 'Unfeature' : 'Feature'}
                </button>
                <button
                  onClick={() => remove(item.id)}
                  disabled={busyId === item.id}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-error-600 bg-white border border-error-200 hover:bg-error-50 disabled:opacity-60 transition-all ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
