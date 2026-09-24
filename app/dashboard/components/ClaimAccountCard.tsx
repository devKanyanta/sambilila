'use client'

// ClaimAccountCard — lets a guest attach an email/password to their session
// without losing any of their quizzes, flashcards, or streaks.

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Check, Loader2 } from 'lucide-react'
import { useSession } from '@/app/hooks/useSession'
import Card from './Card'

export default function ClaimAccountCard() {
  const { isGuest, claimAccount } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!isGuest || success) {
    if (!success) return null
    return (
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-success-50 border border-success-100 flex items-center justify-center">
            <Check className="w-4 h-4 text-success-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Account created</h3>
            <p className="text-xs text-neutral-500">
              Your progress now syncs across all your devices.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setSaving(true)
    const err = await claimAccount(email, password, name || undefined)
    setSaving(false)

    if (err) {
      setError(err)
    } else {
      setSuccess(true)
    }
  }

  if (!isEditing) {
    return (
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-5 h-5 text-primary-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-neutral-900">Save your progress</h3>
            <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed mb-3">
              You&apos;re studying as a guest. Add an email to keep your quizzes,
              flashcards and streaks across all devices — it takes 10 seconds and
              everything stays exactly where it is.
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-all active:scale-95"
            >
              Claim my progress
            </button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-neutral-900 mb-1">Save your progress</h3>
      <p className="text-xs text-neutral-500 mb-4">
        Your data stays exactly as it is — we just add an email and password to this session.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Password <span className="text-neutral-400">(min 8 characters)</span>
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all"
          />
        </div>

        {error && (
          <p className="text-xs text-error-600 bg-error-50 border border-error-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create my account'
            )}
          </motion.button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-500 border border-neutral-200 hover:bg-neutral-50 transition-all"
          >
            Later
          </button>
        </div>
      </form>
    </Card>
  )
}
