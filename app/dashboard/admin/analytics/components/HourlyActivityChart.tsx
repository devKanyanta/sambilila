// app/dashboard/admin/analytics/components/HourlyActivityChart.tsx
'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Clock } from 'lucide-react'

interface HourlyActivityChartProps {
  data: number[] // Array of 24 values (0-23)
  isLoading?: boolean
}

export default function HourlyActivityChart({ data, isLoading }: HourlyActivityChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded bg-neutral-200 animate-pulse" />
          <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="h-48 bg-neutral-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  const chartData = data.map((count, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    label: hour === 0 ? 'Midnight' : hour === 12 ? 'Noon' : `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'}`,
    count,
  }))

  // Find peak hour
  const maxCount = Math.max(...data, 1)
  const peakHour = data.indexOf(maxCount)

  if (chartData.every(d => d.count === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#ff5252]/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-[#ff5252]" />
          </div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">Hourly Activity</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-sm text-neutral-400">
          No activity data available
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#ff5252]/10 flex items-center justify-center">
          <Clock className="w-4 h-4 text-[#ff5252]" />
        </div>
        <div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">Hourly Activity</h3>
          <p className="text-[10px] text-neutral-400">
            Peak at {chartData[peakHour]?.label || 'N/A'} ({maxCount.toLocaleString()} views)
          </p>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: '#a3a3a3' }}
              tickLine={false}
              axisLine={{ stroke: '#f0f0f0' }}
              interval={2}
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
              formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Page Views']}
            />
            <Bar
              dataKey="count"
              fill="#ff5252"
              radius={[3, 3, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
