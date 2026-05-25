'use client'

import { ProfileStatsResponse } from '../types/profile'
import { BarChart3, Brain, Target, TrendingUp } from 'lucide-react'

interface StatsCardProps {
  stats: ProfileStatsResponse | null
  formatStudyTime: (minutes: number) => string
}

export default function StatsCard({ stats, formatStudyTime }: StatsCardProps) {
  const statItems = [
    {
      label: 'Study Sessions',
      value: stats?.counts.studySessions || 0,
      icon: BarChart3,
      bg: 'bg-[#193827]/5',
      text: 'text-[#193827]'
    },
    {
      label: 'Quiz Attempts',
      value: stats?.counts.quizAttempts || 0,
      icon: Brain,
      bg: 'bg-[#ff5252]/5',
      text: 'text-[#ff5252]'
    },
    {
      label: 'Avg Score',
      value: stats ? `${stats.performance.averageScore}%` : '0%',
      icon: Target,
      bg: 'bg-[#2d6b4d]/5',
      text: 'text-[#2d6b4d]'
    },
    {
      label: 'Cards Studied',
      value: stats?.performance.totalCardsStudied || 0,
      icon: TrendingUp,
      bg: 'bg-neutral-100',
      text: 'text-neutral-700'
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-base font-semibold text-neutral-800 mb-4">Learning Statistics</h3>

      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={index} className={`rounded-xl p-4 ${item.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${item.text}`} />
              </div>
              <div className={`text-xl font-bold ${item.text}`}>{item.value}</div>
              <div className="text-xs text-neutral-500 mt-0.5">{item.label}</div>
            </div>
          )
        })}
      </div>

      {stats?.activityPatterns && (
        <div className="mt-5 pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-neutral-700">Weekly Activity</h4>
            <span className="text-[10px] text-neutral-400">Last 7 days</span>
          </div>
          <div className="flex items-end justify-between h-20 gap-1">
            {stats.activityPatterns.byDayOfWeek.map((count, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full max-w-[28px] rounded-lg bg-[#ff5252]/20 transition-all duration-300"
                  style={{ height: `${Math.max(count * 12, 4)}px` }}
                />
                <span className="text-[10px] text-neutral-400">
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
