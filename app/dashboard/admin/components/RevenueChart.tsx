// app/dashboard/admin/components/RevenueChart.tsx
'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Formatter, NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { DollarSign } from 'lucide-react'

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>
  isLoading?: boolean
}

const formatRevenueTooltip: Formatter<ValueType, NameType> = (value) => [
  `$${Number(value ?? 0).toFixed(2)}`,
  'Revenue',
]

export default function RevenueChart({ data, isLoading }: RevenueChartProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl shadow-sm p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#ff5252]/10 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-[#ff5252]" />
        </div>
        <div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">Revenue Over Time</h3>
          <p className="text-[10px] text-neutral-400">All time cumulative revenue</p>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#a3a3a3' }}
              tickLine={false}
              axisLine={{ stroke: '#f0f0f0' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#a3a3a3' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
              formatter={formatRevenueTooltip}
              labelFormatter={(label) => new Date(label + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
            />
            <Bar dataKey="revenue" fill="#ff5252" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
