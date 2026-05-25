'use client'

import { ProfileResponse } from '../types/profile'
import { Brain, BookOpen } from 'lucide-react'

interface ActivityCardProps {
  recentActivity: ProfileResponse['recentActivity'] | null | undefined
}

export default function ActivityCard({ recentActivity }: ActivityCardProps) {
  const hasActivity = recentActivity &&
    (recentActivity.quizResults.length > 0 || recentActivity.studySessions.length > 0)

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-base font-semibold text-neutral-800 mb-4">Recent Activity</h3>

      {!recentActivity ? (
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-[#ff5252] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-neutral-400">Loading activity...</p>
        </div>
      ) : hasActivity ? (
        <div className="space-y-2">
          {recentActivity.quizResults.slice(0, 3).map((result) => (
            <div key={result.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-[#ff5252]/10 flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-[#ff5252]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{result.quiz.title}</p>
                <p className="text-xs text-neutral-500">
                  Score: {result.score}/{result.totalQuestions} &middot; {result.quiz.subject}
                </p>
              </div>
              <span className="text-[10px] text-neutral-400 flex-shrink-0">
                {new Date(result.completedAt).toLocaleDateString()}
              </span>
            </div>
          ))}

          {recentActivity.studySessions.slice(0, 2).map((session) => (
            <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-[#193827]/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-[#193827]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">
                  Studied {session.cardsStudied} cards
                </p>
                <p className="text-xs text-neutral-500">
                  {session.correctAnswers} correct &middot; {session.duration} min
                </p>
              </div>
              <span className="text-[10px] text-neutral-400 flex-shrink-0">
                {new Date(session.startedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-500">No recent activity yet</p>
          <p className="text-xs text-neutral-400 mt-1">Start studying or taking quizzes to see activity here</p>
        </div>
      )}
    </div>
  )
}
