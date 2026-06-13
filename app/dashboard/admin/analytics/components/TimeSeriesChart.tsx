// app/dashboard/admin/analytics/components/TimeSeriesChart.tsx
'use client'

import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { BarChart3 } from 'lucide-react'

interface TimeSeriesChartProps {
  data: Array<{ date: string; page_views: number; visitors: number }>
  isLoading?: boolean
}

export default function TimeSeriesChart({ data, isLoading }: TimeSeriesChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded bg-neutral-200 animate-pulse" />
          <div className="h-5 w-36 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="h-48 bg-neutral-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#193827]/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-[#193827]" />
          </div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">Page Views & Visitors</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-sm text-neutral-400">
          No data available for this period
        </div>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    if (dateStr.includes('T')) {
      // Hourly: "2026-06-13T14:00:00"
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' })
    }
    // Daily: "2026-06-13"
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#193827]/10 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-[#193827]" />
        </div>
        <div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">Page Views & Visitors</h3>
          <p className="text-[10px] text-neutral-400">Daily page views and unique visitors</p>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#193827" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#193827" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff5252" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ff5252" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#a3a3a3' }}
              tickLine={false}
              axisLine={{ stroke: '#f0f0f0' }}
              tickFormatter={formatDate}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#a3a3a3' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
              labelFormatter={(label) => formatDate(label)}
            />
            <Legend
              verticalAlign="bottom"
              height={24}
              formatter={(value: string) => (
                <span className="text-xs text-neutral-600">
                  {value === 'page_views' ? 'Page Views' : 'Unique Visitors'}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="page_views"
              stroke="#193827"
              strokeWidth={2}
              fill="url(#viewsGradient)"
              name="page_views"
            />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="#ff5252"
              strokeWidth={2}
              fill="url(#visitorsGradient)"
              name="visitors"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
