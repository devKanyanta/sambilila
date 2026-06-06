'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Share2, Home, ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react'
import Link from 'next/link'

import QuizView from '@/app/dashboard/quiz/components/quizView'
import QuizResultsModal from '@/app/dashboard/quiz/components/quizResults'
import Card from '@/app/dashboard/components/Card'
import { Quiz, UserAnswers, QuizResult, DetailedResult } from '@/app/dashboard/quiz/components/types'

export default function SharedQuizPage({
  params,
}: {
  params: Promise<{ shareToken: string }>
}) {
  const router = useRouter()
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<(Quiz & { createdByName?: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [detailedResults, setDetailedResults] = useState<DetailedResult[]>([])
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    params.then(({ shareToken: token }) => {
      setShareToken(token)
      fetchQuiz(token)
    })
  }, [params])

  const fetchQuiz = async (token: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/public/quizzes/${token}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('Quiz not found or not shared')
        throw new Error('Failed to load quiz')
      }
      const data = await res.json()
      setQuiz(data.quiz)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = useCallback((questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!quiz || !shareToken) return
    setIsSubmitting(true)
    try {
      const answers = Object.entries(userAnswers).map(
        ([questionId, answer]) => ({ questionId, answer })
      )
      const res = await fetch(`/api/public/quizzes/${shareToken}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      if (!res.ok) throw new Error('Failed to submit quiz')
      const data = await res.json()
      setQuizResult(data.result)
      setDetailedResults(data.detailedResults)
      setShowResults(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
    } finally {
      setIsSubmitting(false)
    }
  }, [quiz, shareToken, userAnswers])

  const handleStartNewQuiz = useCallback(() => {
    setQuizResult(null)
    setDetailedResults([])
    setShowResults(false)
    setUserAnswers({})
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ececec] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-sm text-neutral-500">Loading shared quiz...</p>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-[#ececec] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-lg font-heading font-medium text-neutral-900 mb-2">
            Quiz Unavailable
          </h1>
          <p className="text-sm text-neutral-500 mb-6">
            {error || 'This quiz could not be found. It may have been removed or the share link is invalid.'}
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
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Share2 className="w-3 h-3" />
            Shared Quiz
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Quiz Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">
              {quiz.subject}
            </span>
            <span className="text-xs text-neutral-400">
              by {quiz.createdByName}
            </span>
          </div>
          <h1 className="text-xl font-heading font-medium text-neutral-900">
            {quiz.title}
          </h1>
          {quiz.description && (
            <p className="text-sm text-neutral-500 mt-1">{quiz.description}</p>
          )}
          <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
            <span>{quiz.questions.length} questions</span>
            <span>·</span>
            <span>Results won&apos;t be saved</span>
          </div>
        </div>

        {showResults && quizResult && detailedResults.length > 0 ? (
          <>
            <QuizResultsModal
              show={true}
              onClose={() => setShowResults(false)}
              quizResult={quizResult}
              detailedResults={detailedResults}
              onStartNewQuiz={handleStartNewQuiz}
              onReviewAgain={() => setShowResults(false)}
            />
            <div className="text-center pt-6">
              <button
                onClick={handleStartNewQuiz}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Retake Quiz
              </button>
            </div>
          </>
        ) : (
          <QuizView
            quiz={quiz}
            userAnswers={userAnswers}
            isSubmitting={isSubmitting}
            onAnswer={handleAnswer}
            onSubmit={handleSubmit}
            onStartNewQuiz={handleStartNewQuiz}
            onBack={() => router.push('/')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-neutral-400">
        <p>Made with Lernopia — Master any subject with AI</p>
      </footer>
    </div>
  )
}
