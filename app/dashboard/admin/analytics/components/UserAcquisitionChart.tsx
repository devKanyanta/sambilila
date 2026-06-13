// app/dashboard/admin/analytics/components/UserAcquisitionChart.tsx
'use client'

import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { UserPlus } from 'lucide-react'

interface UserAcquisitionChartProps {
  data: Array<{ date: string; count: number }>
  isLoading?: boolean
}

export default function UserAcquisitionChart({ data, isLoading }: UserAcquisitionChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded bg-neutral-200 animate-pulse" />
          <div className="h-5 w-40 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="h-48 bg-neutral-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#2d6b4d]/10 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-[#2d6b4d]" />
          </div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">User Acquisition</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-sm text-neutral-400">
          No registration data available
        </div>
      </div>
    )
  }

  // Format dates for display
  const chartData = data.map(d => ({
    ...d,
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  // Cumulative
  let runningTotal = 0
  const cumulativeData = chartData.map(d => {
    runningTotal += d.count
    return { ...d, cumulative: runningTotal }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#2d6b4d]/10 flex items-center justify-center">
          <UserPlus className="w-4 h-4 text-[#2d6b4d]" />
        </div>
        <div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">User Acquisition</h3>
          <p className="text-[10px] text-neutral-400">New registrations over time</p>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cumulativeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="registrationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2d6b4d" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2d6b4d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#a3a3a3' }}
              tickLine={false}
              axisLine={{ stroke: '#f0f0f0' }}
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
              formatter={(value, name) => [
                Number(value ?? 0).toLocaleString(),
                name === 'cumulative' ? 'Total Registrations' : 'New Registrations'
              ]}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#2d6b4d"
              strokeWidth={2}
              fill="url(#registrationGradient)"
              name="cumulative"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
