'use client'

import { ProfileStatsResponse } from '../types/profile'
import { BarChart3, Brain, Target, TrendingUp } from 'lucide-react'
import Card from '@/app/dashboard/components/Card'

interface StatsCardProps {
  stats: ProfileStatsResponse | null
  formatStudyTime: (minutes: number) => string
}

export default function StatsCard({ stats, formatStudyTime }: StatsCardProps) {
  const statItems = [
    { label: 'Study Sessions', value: stats?.counts.studySessions || 0, icon: BarChart3, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Quiz Attempts', value: stats?.counts.quizAttempts || 0, icon: Brain, color: 'text-accent-600', bg: 'bg-accent-50' },
    { label: 'Avg Score', value: stats ? `${stats.performance.averageScore}%` : '0%', icon: Target, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Cards Studied', value: stats?.performance.totalCardsStudied || 0, icon: TrendingUp, color: 'text-neutral-600', bg: 'bg-neutral-100' },
  ]

  return (
    <Card className="p-5">
      <h3 className="text-sm font-medium text-neutral-900 mb-4">Learning Statistics</h3>

      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={index} className={`rounded-xl p-4 ${item.bg}`}>
              <Icon className={`w-4 h-4 ${item.color} mb-2`} />
              <div className={`text-xl font-semibold ${item.color}`}>{item.value}</div>
              <div className="text-xs text-neutral-400 mt-0.5">{item.label}</div>
            </div>
          )
        })}
      </div>

      {stats?.activityPatterns && (
        <div className="mt-5 pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-neutral-700">Weekly Activity</h4>
            <span className="text-[10px] text-neutral-400">Last 7 days</span>
          </div>
          <div className="flex items-end justify-between h-20 gap-1">
            {stats.activityPatterns.byDayOfWeek.map((count, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full max-w-[28px] rounded-lg bg-primary-100 transition-all duration-300"
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
    </Card>
  )
}
