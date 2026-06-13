// app/dashboard/admin/analytics/components/FeatureUsageChart.tsx
'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Zap } from 'lucide-react'

interface FeatureUsageChartProps {
  data: Array<{ event_name: string; count: number }>
  isLoading?: boolean
}

const EVENT_LABELS: Record<string, string> = {
  quiz_created: 'Quiz Created',
  quiz_completed: 'Quiz Completed',
  flashcard_created: 'Flashcards Created',
  study_session_started: 'Study Started',
  study_session_ended: 'Study Ended',
  user_registered: 'Registered',
  user_login: 'Logged In',
  subscription_action: 'Subscription Change',
  file_uploaded: 'File Uploaded',
  content_shared: 'Content Shared',
  search_performed: 'Search Performed',
  heartbeat: 'Active Sessions',
}

export default function FeatureUsageChart({ data, isLoading }: FeatureUsageChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded bg-neutral-200 animate-pulse" />
          <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 bg-neutral-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Filter out heartbeats and session events
  const filtered = (data || []).filter(
    d => d.event_name !== 'heartbeat' && d.event_name !== 'session_start' && d.event_name !== 'session_end'
  )

  if (filtered.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#ff5252]/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#ff5252]" />
          </div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">Feature Usage</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-sm text-neutral-400">
          No feature usage data available
        </div>
      </div>
    )
  }

  const chartData = filtered.map(d => ({
    ...d,
    label: EVENT_LABELS[d.event_name] || d.event_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#ff5252]/10 flex items-center justify-center">
          <Zap className="w-4 h-4 text-[#ff5252]" />
        </div>
        <div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">Feature Usage</h3>
          <p className="text-[10px] text-neutral-400">Actions performed by users</p>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#a3a3a3' }}
              tickLine={false}
              axisLine={{ stroke: '#f0f0f0' }}
            />
            <YAxis
              dataKey="label"
              type="category"
              tick={{ fontSize: 10, fill: '#6b6b6b' }}
              tickLine={false}
              axisLine={false}
              width={130}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
              formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Events']}
            />
            <Bar
              dataKey="count"
              fill="#ff5252"
              radius={[0, 4, 4, 0]}
              maxBarSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
