'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Star, Plus, X, CheckCircle, AlertCircle, Loader2, MessageSquareHeart } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  role: string | null
  rating: number | null
  message: string
  createdAt: string
}

/** Deterministic pastel color from a name — colorful wall, no fake stock photos. */
const AVATAR_COLORS = [
  'bg-primary-100 text-primary-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
]

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
          }`}
        />
      ))}
    </div>
  )
}

const MESSAGE_MAX = 600

function FeedbackForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const submit = async () => {
    setStatus('submitting')
    setErrorMsg('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, role, rating, message }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setStatus('success')
      } else {
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  const reset = () => {
    setOpen(false)
    setName('')
    setRole('')
    setRating(0)
    setMessage('')
    setStatus('idle')
    setErrorMsg('')
  }

  if (!open) {
    return (
      <div className="text-center mt-14">
        <button
          onClick={() => setOpen(true)}
          className="btn-outline inline-flex px-6 py-3 text-sm rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Share your experience
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-14 max-w-xl mx-auto bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8"
    >
      {status === 'success' ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-success-500" />
          </div>
          <h3 className="text-lg font-fredoka font-semibold text-neutral-900 mb-1.5">
            Thank you!
          </h3>
          <p className="text-sm text-neutral-500 mb-6">
            Your feedback was submitted and will appear here after a quick review.
          </p>
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-all"
          >
            Done
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-fredoka font-semibold text-neutral-900">
              Share your experience
            </h3>
            <button
              onClick={reset}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                How would you rate Lernopia? <span className="text-primary-500">*</span>
              </label>
              <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onClick={() => setRating(star)}
                    className="p-0.5 transition-transform hover:scale-110"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= (hovered || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Name + role */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fb-name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Name <span className="text-primary-500">*</span>
                </label>
                <input
                  id="fb-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="fb-role" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  I am a…
                </label>
                <input
                  id="fb-role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all"
                  placeholder="Student, teacher…"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="fb-message" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Your feedback <span className="text-primary-500">*</span>
              </label>
              <textarea
                id="fb-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all resize-none"
                placeholder="How has Lernopia helped you?"
              />
              <p className="text-xs text-neutral-400 mt-1 text-right">
                {message.length}/{MESSAGE_MAX}
              </p>
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-sm text-error-600 bg-error-50 px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={status === 'submitting' || !name.trim() || !message.trim() || !rating}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <MessageSquareHeart className="w-4 h-4" />
                  Submit feedback
                </>
              )}
            </button>

            <p className="text-xs text-neutral-400 text-center">
              Feedback is reviewed before appearing publicly.
            </p>
          </div>
        </>
      )}
    </motion.div>
  )
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/feedback')
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setTestimonials(data.feedback)
      setError(false)
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section id="testimonials" className="bg-neutral-50 py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-y border-neutral-200/70">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-fredoka font-bold text-neutral-900 tracking-tight mb-3"
          >
            Loved by learners
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-neutral-500"
          >
            Real feedback from real students and teachers
          </motion.p>
        </div>

        {/* Masonry Grid Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:_balance]"
        >
          {(testimonials ?? []).map((testimonial) => (
            <div
              key={testimonial.id}
              className="break-inside-avoid bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col justify-between transition-shadow duration-200 hover:shadow-md"
            >
              <div>
                <Stars rating={testimonial.rating} />
                <p className="text-[15px] text-neutral-700 leading-relaxed mt-3">
                  {testimonial.message}
                </p>
              </div>

              <div>
                <div className="my-5 border-t border-neutral-100" />

                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold border border-black/5 ${avatarColor(testimonial.name)}`}
                    aria-hidden
                  >
                    {initials(testimonial.name)}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[15px] font-semibold text-neutral-900 tracking-tight truncate">
                      {testimonial.name}
                    </span>
                    {testimonial.role && (
                      <span className="block text-xs text-neutral-500 truncate">
                        {testimonial.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {testimonials && !error && (
          <FeedbackForm onSubmitted={load} />
        )}

        {error && (
          <p className="text-center text-sm text-neutral-400 mt-10">
            Feedback is unavailable right now — please check back soon.
          </p>
        )}
      </div>
    </section>
  )
}
