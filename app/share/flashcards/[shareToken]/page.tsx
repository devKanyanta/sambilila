'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, Share2, Home, AlertTriangle, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'

import Card from '@/app/dashboard/components/Card'
import type { FlashcardSet as BaseFlashcardSet } from '@/app/dashboard/flashcards/components/types'

type SharedFlashcardSet = BaseFlashcardSet & { createdByName?: string }
import FlashcardViewer from '@/app/dashboard/flashcards/components/FlashcardViewer'

export default function SharedFlashcardPage({
  params,
}: {
  params: Promise<{ shareToken: string }>
}) {
  const [flashcardSet, setFlashcardSet] = useState<SharedFlashcardSet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    params.then(({ shareToken: token }) => {
      fetchFlashcardSet(token)
    })
  }, [params])

  const fetchFlashcardSet = async (token: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/public/flashcards/${token}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('Flashcard set not found or not shared')
        throw new Error('Failed to load flashcard set')
      }
      const data = await res.json()
      setFlashcardSet(data.flashcardSet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flashcard set')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ececec] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-sm text-neutral-500">Loading shared flashcards...</p>
        </div>
      </div>
    )
  }

  if (error || !flashcardSet) {
    return (
      <div className="min-h-screen bg-[#ececec] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-lg font-heading font-medium text-neutral-900 mb-2">
            Flashcards Unavailable
          </h1>
          <p className="text-sm text-neutral-500 mb-6">
            {error || 'This flashcard set could not be found. It may have been removed or the share link is invalid.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-all"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ececec]">
      {/* Public Navbar */}
      <nav className="bg-white border-b border-neutral-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-heading font-medium text-sm text-neutral-900">Lernopia</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Share2 className="w-3 h-3" />
              Shared Flashcards
            </div>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-medium hover:bg-primary-600 transition-all"
            >
              <Sparkles className="w-3 h-3" />
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Set Info */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">
              {flashcardSet.subject}
            </span>
            <span className="text-xs text-neutral-400">
              by {flashcardSet.createdByName}
            </span>
          </div>
          <h1 className="text-xl font-heading font-medium text-neutral-900">
            {flashcardSet.title}
          </h1>
          {flashcardSet.description && (
            <p className="text-sm text-neutral-500 mt-1">{flashcardSet.description}</p>
          )}
          <p className="text-xs text-neutral-400 mt-2">
            {flashcardSet.cards?.length || 0} cards
          </p>
        </div>

        {/* Flashcard Viewer */}
        <FlashcardViewer
          selectedSet={flashcardSet}
          currentCardIndex={currentCardIndex}
          isFlipped={isFlipped}
          showSignupCta={true}
          onClose={() => {}}
          onNextCard={() => {
            if (flashcardSet.cards && currentCardIndex < flashcardSet.cards.length - 1) {
              setCurrentCardIndex(prev => prev + 1)
              setIsFlipped(false)
            }
          }}
          onPrevCard={() => {
            if (currentCardIndex > 0) {
              setCurrentCardIndex(prev => prev - 1)
              setIsFlipped(false)
            }
          }}
          onToggleFlip={() => setIsFlipped(prev => !prev)}
        />
      </main>

      {/* Registration CTA */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 p-8 text-center">
          <div className="absolute inset-0 bg-white/10" />
          <div className="relative">
            <div className="w-12 h-12 mx-auto rounded-xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-heading font-semibold text-white mb-2">
              Create Your Own Flashcards
            </h2>
            <p className="text-sm text-white/80 mb-6 max-w-sm mx-auto">
              Turn your notes into smart flashcards with AI. Study smarter, remember longer.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-primary-700 text-sm font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              Get started free
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-neutral-400">
        <p>Made with Lernopia — Master any subject with AI</p>
      </footer>
    </div>
  )
}
