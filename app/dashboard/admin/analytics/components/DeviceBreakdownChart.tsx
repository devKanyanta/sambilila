// app/dashboard/admin/analytics/components/DeviceBreakdownChart.tsx
'use client'

import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import { Monitor } from 'lucide-react'

interface DeviceBreakdownChartProps {
  data: Record<string, number>
  isLoading?: boolean
}

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#193827',
  mobile: '#ff5252',
  tablet: '#eab308',
}

const DEVICE_ICONS: Record<string, string> = {
  desktop: '🖥️',
  mobile: '📱',
  tablet: '📟',
}

export default function DeviceBreakdownChart({ data, isLoading }: DeviceBreakdownChartProps) {
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

  const chartData = Object.entries(data || {})
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
      icon: DEVICE_ICONS[key] || '',
    }))

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
            <Monitor className="w-4 h-4 text-neutral-400" />
          </div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">Device Breakdown</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-sm text-neutral-400">
          No device data
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
        <div className="w-8 h-8 rounded-lg bg-[#193827]/10 flex items-center justify-center">
          <Monitor className="w-4 h-4 text-[#193827]" />
        </div>
        <div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">Device Breakdown</h3>
          <p className="text-[10px] text-neutral-400">Desktop vs Mobile vs Tablet</p>
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
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={DEVICE_COLORS[entry.name.toLowerCase()] || '#a8a8a8'}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
              formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Visitors']}
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
