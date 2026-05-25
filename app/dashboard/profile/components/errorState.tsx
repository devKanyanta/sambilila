'use client'

import { useRouter } from 'next/navigation'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({ message = "Something went wrong", onRetry }: ErrorStateProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#ececec]">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-heading font-semibold text-neutral-800 mb-1">Error Loading Profile</h2>
        <p className="text-sm text-neutral-500 mb-6">{message}</p>

        <div className="space-y-2">
          {onRetry && (
            <button onClick={onRetry}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md active:scale-[0.98]"
              style={{ backgroundColor: '#ff5252' }}>
              Try Again
            </button>
          )}
          <button onClick={() => router.push('/login')}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-all">
            Go to Login
          </button>
        </div>
      </div>
    </div>
  )
}
