// app/dashboard/admin/analytics/components/OverviewCards.tsx
'use client'

import { motion } from 'framer-motion'
import { Eye, Users, Clock, TrendingUp } from 'lucide-react'
import { containerStagger, statCardItem } from '@/app/dashboard/animations'
import type { AnalyticsStats } from '../types'

interface OverviewCardsProps {
  stats: AnalyticsStats['overview']
  isLoading?: boolean
}

export default function OverviewCards({ stats, isLoading }: OverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 animate-pulse mb-3" />
            <div className="h-7 w-20 bg-neutral-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    {
      icon: Eye,
      value: stats.total_page_views.toLocaleString(),
      label: 'Total Page Views',
      sublabel: 'All time',
      color: '#193827',
      bg: 'bg-[#193827]/5',
      iconBg: '#1938271a',
    },
    {
      icon: Users,
      value: stats.unique_visitors.toLocaleString(),
      label: 'Unique Visitors',
      sublabel: `${((stats.unique_visitors / Math.max(stats.total_page_views, 1)) * 100).toFixed(1)}% return rate`,
      color: '#2d6b4d',
      bg: 'bg-[#2d6b4d]/5',
      iconBg: '#2d6b4d1a',
    },
    {
      icon: Clock,
      value: stats.avg_time_on_site_seconds
        ? `${Math.floor(stats.avg_time_on_site_seconds / 60)}m ${stats.avg_time_on_site_seconds % 60}s`
        : '--',
      label: 'Avg. Time on Site',
      sublabel: stats.avg_time_on_site_seconds ? 'Per session' : 'Insufficient data',
      color: '#ff5252',
      bg: 'bg-[#ff5252]/5',
      iconBg: '#ff52521a',
    },
    {
      icon: TrendingUp,
      value: stats.total_page_views > 0
        ? `${(stats.unique_visitors / Math.max(stats.total_page_views, 1) * 100).toFixed(1)}%`
        : '--',
      label: 'Engagement Rate',
      sublabel: 'Visitors / Page Views',
      color: '#eab308',
      bg: 'bg-[#eab308]/5',
      iconBg: '#eab3081a',
    },
  ]

  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.label}
            variants={statCardItem}
            className={`${card.bg} rounded-xl p-4 shadow-sm`}
          >
            <div className="flex items-center gap-3 mb-1.5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-white shadow-sm"
                style={{ backgroundColor: card.iconBg }}
              >
                <Icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <span className="text-2xl font-heading font-semibold text-neutral-800">
                {card.value}
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium">{card.label}</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">{card.sublabel}</p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
