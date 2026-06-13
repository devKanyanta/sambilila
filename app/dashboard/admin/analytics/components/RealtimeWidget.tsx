// app/dashboard/admin/analytics/components/RealtimeWidget.tsx
'use client'

import { motion } from 'framer-motion'
import { Activity, Eye } from 'lucide-react'

interface RealtimeWidgetProps {
  activeVisitors: number
  pageViewsToday: number
  isLoading?: boolean
}

export default function RealtimeWidget({ activeVisitors, pageViewsToday, isLoading }: RealtimeWidgetProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse" />
          <div className="h-5 w-24 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse" />
          <div className="h-5 w-24 bg-neutral-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Active Visitors */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-[#193827]/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#193827]" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-800">
                {activeVisitors}
              </p>
              <p className="text-xs text-neutral-500 font-medium">Visitors Now</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-neutral-200" />

          {/* Today's Views */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff5252]/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-[#ff5252]" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-800">
                {pageViewsToday.toLocaleString()}
              </p>
              <p className="text-xs text-neutral-500 font-medium">Page Views Today</p>
            </div>
          </div>
        </div>

        {/* Auto-refresh indicator */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-neutral-400">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Live
        </div>
      </div>
    </motion.div>
  )
}
