// app/dashboard/admin/analytics/components/VisitorGeographyChart.tsx
'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Globe } from 'lucide-react'

interface VisitorGeographyChartProps {
  data: Array<{ country: string; visitors: number }>
  isLoading?: boolean
}

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', ZM: '🇿🇲',
  ZA: '🇿🇦', NG: '🇳🇬', KE: '🇰🇪', GH: '🇬🇭', EG: '🇪🇬',
  IN: '🇮🇳', CN: '🇨🇳', JP: '🇯🇵', KR: '🇰🇷', SG: '🇸🇬',
  DE: '🇩🇪', FR: '🇫🇷', NL: '🇳🇱', SE: '🇸🇪', NO: '🇳🇴',
  BR: '🇧🇷', MX: '🇲🇽', AR: '🇦🇷', CO: '🇨🇴',
}

export default function VisitorGeographyChart({ data, isLoading }: VisitorGeographyChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded bg-neutral-200 animate-pulse" />
          <div className="h-5 w-36 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 bg-neutral-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#193827]/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-[#193827]" />
          </div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">Visitor Geography</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-sm text-neutral-400">
          No geographic data available
        </div>
      </div>
    )
  }

  const chartData = data.map(d => ({
    ...d,
    flag: COUNTRY_FLAGS[d.country] || '🌍',
    label: `${COUNTRY_FLAGS[d.country] || '🌍'} ${d.country}`,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#193827]/10 flex items-center justify-center">
          <Globe className="w-4 h-4 text-[#193827]" />
        </div>
        <div>
          <h3 className="text-sm font-heading font-medium text-neutral-800">Visitor Geography</h3>
          <p className="text-[10px] text-neutral-400">Visitors by country</p>
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
              tick={{ fontSize: 11, fill: '#6b6b6b' }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
              formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Visitors']}
            />
            <Bar
              dataKey="visitors"
              fill="#193827"
              radius={[0, 4, 4, 0]}
              maxBarSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
