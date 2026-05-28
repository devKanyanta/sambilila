'use client'

import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { statCardItem } from '../animations'

interface StatBlockProps {
  icon?: LucideIcon
  value: string | number
  label: string
  color?: string
  bgColor?: string
  iconBg?: string
  animate?: boolean
  trend?: { value: string; positive: boolean }
}

export default function StatBlock({
  icon: Icon,
  value,
  label,
  color = '#2d6b4d',
  bgColor = 'bg-white',
  iconBg,
  animate = true,
  trend,
}: StatBlockProps) {
  return (
    <motion.div
      variants={animate ? statCardItem : undefined}
      className={`${bgColor} rounded-xl p-4 shadow-md`}
    >
      <div className="flex items-center gap-3 mb-1.5">
        {Icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white shadow-sm"
            style={iconBg ? { backgroundColor: iconBg } : undefined}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
        )}
        <span className="text-2xl font-heading font-semibold text-neutral-800">
          {value}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500 font-medium">{label}</p>
        {trend && (
          <span className={`text-[10px] font-medium ${trend.positive ? 'text-success-600' : 'text-secondary-600'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </motion.div>
  )
}
