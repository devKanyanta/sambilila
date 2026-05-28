'use client'

import { ProfileResponse } from '../types/profile'
import { Brain, BookOpen, Clock, TrendingUp } from 'lucide-react'
import Card from '@/app/dashboard/components/Card'

interface ActivityCardProps {
  recentActivity: ProfileResponse['recentActivity'] | null | undefined
}

export default function ActivityCard({ recentActivity }: ActivityCardProps) {
  const hasActivity = recentActivity &&
    (recentActivity.quizResults.length > 0 || recentActivity.studySessions.length > 0)

  return (
    <Card className="p-5">
      <h3 className="text-sm font-medium text-neutral-900 mb-4">Recent Activity</h3>

      {!recentActivity ? (
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-3" />
          <p className="text-sm text-neutral-400">Loading activity...</p>
        </div>
      ) : hasActivity ? (
        <div className="space-y-1">
          {recentActivity.quizResults.slice(0, 3).map((result) => (
            <div key={result.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-accent-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Brain className="w-4 h-4 text-accent-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{result.quiz.title}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Score: {result.score}/{result.totalQuestions} &middot; {result.quiz.subject}
                </p>
              </div>
              <span className="text-[10px] text-neutral-400 flex-shrink-0 mt-0.5">
                {new Date(result.completedAt).toLocaleDateString()}
              </span>
            </div>
          ))}

          {recentActivity.studySessions.slice(0, 2).map((session) => (
            <div key={session.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4 text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  Studied {session.cardsStudied} cards
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {session.correctAnswers} correct &middot; {session.duration} min
                </p>
              </div>
              <span className="text-[10px] text-neutral-400 flex-shrink-0 mt-0.5">
                {new Date(session.startedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <TrendingUp className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-500">No recent activity yet</p>
          <p className="text-xs text-neutral-400 mt-1">Start studying or taking quizzes to see activity here</p>
        </div>
      )}
    </Card>
  )
}
