// app/dashboard/admin/components/PlanDistributionPie.tsx
'use client'

import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Layers } from 'lucide-react'

interface PlanDistributionPieProps {
  data: Record<string, number>
  isLoading?: boolean
}

const COLORS = ['#e5e5e5', '#193827', '#ff5252', '#2d6b4d', '#dc2626']
const LABEL_MAP: Record<string, string> = {
  free: 'Free',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

export default function PlanDistributionPie({ data, isLoading }: PlanDistributionPieProps) {
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

  const chartData = Object.entries(data)
    .filter(([, value]) => value > 0)
    .map(([slug, value]) => ({
      name: LABEL_MAP[slug] || slug,
      value,
    }))

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
            <Layers className="w-4 h-4 text-neutral-400" />
          </div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">Plan Distribution</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-sm text-neutral-400">
          No data available
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="bg-white rounded-xl shadow-sm p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#2d6b4d]/10 flex items-center justify-center">
          <Layers className="w-4 h-4 text-[#2d6b4d]" />
        </div>
        <div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">Plan Distribution</h3>
          <p className="text-[10px] text-neutral-400">User subscription plans</p>
        </div>
      </div>
      <div className="h-48 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
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
              formatter={(value: number, name: string) => [value.toLocaleString(), name]}
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
