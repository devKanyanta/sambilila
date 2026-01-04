'use client'

import { ProfileResponse } from '../types/profile'

interface ActivityCardProps {
  recentActivity: ProfileResponse['recentActivity'] | null | undefined
}

export default function ActivityCard({ recentActivity }: ActivityCardProps) {
  const hasActivity = recentActivity && 
    (recentActivity.quizResults.length > 0 || recentActivity.studySessions.length > 0)
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
      
      {!recentActivity ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-sm text-gray-500">Loading activity...</p>
        </div>
      ) : hasActivity ? (
        <div className="space-y-3">
          {recentActivity.quizResults.slice(0, 3).map((result) => (
            <div key={result.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-md">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-blue-600">🧩</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {result.quiz.title}
                </p>
                <p className="text-xs text-gray-500">
                  Score: {result.score}/{result.totalQuestions} • {result.quiz.subject}
                </p>
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {new Date(result.completedAt).toLocaleDateString()}
              </span>
            </div>
          ))}

          {recentActivity.studySessions.slice(0, 2).map((session) => (
            <div key={session.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-md">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-green-600">📚</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Studied {session.cardsStudied} cards
                </p>
                <p className="text-xs text-gray-500">
                  {session.correctAnswers} correct • {session.duration} min
                </p>
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {new Date(session.startedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No recent activity yet</p>
          <p className="text-xs text-gray-400 mt-1">Start studying or taking quizzes to see activity here</p>
        </div>
      )}
    </div>
  )
}