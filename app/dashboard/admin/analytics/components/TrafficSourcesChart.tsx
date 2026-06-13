// app/dashboard/admin/analytics/components/TrafficSourcesChart.tsx
'use client'

import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Share2 } from 'lucide-react'

interface TrafficSourcesChartProps {
  data: Array<{ source: string; visits: number }>
  isLoading?: boolean
}

const COLORS = ['#193827', '#ff5252', '#eab308', '#2d6b4d', '#a8a8a8', '#6b6b6b']
const SOURCE_ICONS: Record<string, string> = {
  direct: '🔗',
  Google: '🔍',
  Facebook: '📘',
  'Twitter/X': '🐦',
  LinkedIn: '💼',
  Instagram: '📸',
  Reddit: '🤖',
  YouTube: '▶️',
  other: '🔗',
}

export default function TrafficSourcesChart({ data, isLoading }: TrafficSourcesChartProps) {
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

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#eab308]/10 flex items-center justify-center">
            <Share2 className="w-4 h-4 text-[#eab308]" />
          </div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">Traffic Sources</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-sm text-neutral-400">
          No traffic source data
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + d.visits, 0)

  const chartData = data.map(d => ({
    ...d,
    percentage: ((d.visits / total) * 100).toFixed(1),
    label: `${SOURCE_ICONS[d.source] || ''} ${d.source}: ${d.visits.toLocaleString()} (${((d.visits / total) * 100).toFixed(1)}%)`,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#eab308]/10 flex items-center justify-center">
          <Share2 className="w-4 h-4 text-[#eab308]" />
        </div>
        <div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">Traffic Sources</h3>
          <p className="text-[10px] text-neutral-400">Where visitors come from</p>
        </div>
      </div>
      <div className="h-48 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              paddingAngle={3}
              dataKey="visits"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
              formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Visits']}
            />
            <Legend
              verticalAlign="bottom"
              height={30}
              formatter={(value: string) => (
                <span className="text-xs text-neutral-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
