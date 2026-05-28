'use client'

import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({ message = "Something went wrong", onRetry }: ErrorStateProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-lg font-heading font-medium text-neutral-900 mb-1">Error Loading Profile</h2>
        <p className="text-sm text-neutral-400 mb-6">{message}</p>

        <div className="space-y-2">
          {onRetry && (
            <button onClick={onRetry}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-all active:scale-95">
              Try Again
            </button>
          )}
          <button onClick={() => router.push('/login')}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all active:scale-95">
            Go to Login
          </button>
        </div>
      </div>
    </div>
  )
}
