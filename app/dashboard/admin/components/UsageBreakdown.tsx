// app/dashboard/admin/components/UsageBreakdown.tsx
'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { BarChart3 } from 'lucide-react'

interface UsageBreakdownProps {
  data: Array<{ month: string; quizzes: number; flashcards: number }>
  isLoading?: boolean
}

export default function UsageBreakdown({ data, isLoading }: UsageBreakdownProps) {
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse mb-3" />
        <div className="h-32 bg-neutral-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4">
        <h4 className="text-sm font-medium text-neutral-700 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-neutral-400" />
          Monthly Usage
        </h4>
        <p className="text-xs text-neutral-400 text-center py-6">No usage data available</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h4 className="text-sm font-medium text-neutral-700 mb-3 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-neutral-400" />
        Monthly Usage (Last 6 Months)
      </h4>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#a3a3a3' }}
              tickLine={false}
              axisLine={{ stroke: '#f0f0f0' }}
            />
            <YAxis tick={{ fontSize: 10, fill: '#a3a3a3' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                fontSize: '12px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px' }}
              verticalAlign="bottom"
              height={20}
            />
            <Bar dataKey="quizzes" name="Quizzes" fill="#ff5252" radius={[3, 3, 0, 0]} maxBarSize={20} />
            <Bar dataKey="flashcards" name="Flashcards" fill="#193827" radius={[3, 3, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
