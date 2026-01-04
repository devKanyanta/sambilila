'use client'

import { ProfileStatsResponse } from '../types/profile'

interface StatsCardProps {
  stats: ProfileStatsResponse | null
  formatStudyTime: (minutes: number) => string
}

export default function StatsCard({ stats, formatStudyTime }: StatsCardProps) {
  const statItems = [
    {
      label: 'Study Sessions',
      value: stats?.counts.studySessions || 0,
      color: 'bg-blue-50 text-blue-700'
    },
    {
      label: 'Quiz Attempts',
      value: stats?.counts.quizAttempts || 0,
      color: 'bg-green-50 text-green-700'
    },
    {
      label: 'Avg Score',
      value: stats ? `${stats.performance.averageScore}%` : '0%',
      color: 'bg-purple-50 text-purple-700'
    },
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Statistics</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <div key={index} className={`rounded-lg p-4 ${item.color}`}>
            <div className="text-2xl font-semibold">{item.value}</div>
            <div className="text-sm mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {stats?.activityPatterns && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-gray-900">Weekly Activity</h4>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>
          <div className="flex items-end justify-between h-24">
            {stats.activityPatterns.byDayOfWeek.map((count, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-8 rounded-t bg-blue-100 transition-all duration-300"
                  style={{ height: `${Math.min(count * 15, 100)}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}