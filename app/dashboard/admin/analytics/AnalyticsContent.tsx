// app/dashboard/admin/analytics/AnalyticsContent.tsx
'use client'

import { motion } from 'framer-motion'
import { BarChart3, RefreshCw, AlertTriangle } from 'lucide-react'
import PageHeader from '@/app/dashboard/components/PageHeader'
import AnimatedSection from '@/app/dashboard/components/AnimatedSection'
import { containerStaggerSlow } from '@/app/dashboard/animations'
import { useAnalytics } from './hooks/useAnalytics'
import type { TimeRange } from './types'
import { TIME_RANGE_LABELS } from './types'
import RealtimeWidget from './components/RealtimeWidget'
import OverviewCards from './components/OverviewCards'
import TimeSeriesChart from './components/TimeSeriesChart'
import HourlyActivityChart from './components/HourlyActivityChart'
import TopPagesChart from './components/TopPagesChart'
import VisitorGeographyChart from './components/VisitorGeographyChart'
import TrafficSourcesChart from './components/TrafficSourcesChart'
import DeviceBreakdownChart from './components/DeviceBreakdownChart'
import BrowserBreakdownChart from './components/BrowserBreakdownChart'
import FeatureUsageChart from './components/FeatureUsageChart'
import UserAcquisitionChart from './components/UserAcquisitionChart'

const RANGE_OPTIONS: TimeRange[] = ['today', '24h', '7d', '30d', 'all']

export default function AnalyticsContent() {
  const { stats, loading, error, range, isOffline, changeRange, refresh } = useAnalytics()

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerStaggerSlow}
      className="space-y-6"
    >
      {/* Header */}
      <AnimatedSection>
        <PageHeader
          title="Analytics"
          subtitle="Site traffic, feature usage, and user behavior"
          icon={BarChart3}
          action={
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-neutral-500 bg-white border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-700 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          }
        />
      </AnimatedSection>

      {/* Offline Banner */}
      {isOffline && (
        <AnimatedSection>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-warning-50 border border-warning-200 text-warning-800"
          >
            <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Analytics server is temporarily unavailable</p>
              <p className="text-xs text-warning-600 mt-0.5">The tracking server may be offline. Data will resume once it&apos;s back online.</p>
            </div>
          </motion.div>
        </AnimatedSection>
      )}

      {/* Time Range Selector */}
      <AnimatedSection delay={0.05}>
        <div className="flex items-center gap-2 flex-wrap">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => changeRange(option)}
              disabled={loading}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === option
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-white text-neutral-500 border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-700'
              } disabled:opacity-50`}
            >
              {TIME_RANGE_LABELS[option]}
            </button>
          ))}
        </div>
      </AnimatedSection>

      {/* Realtime Widget */}
      {stats && (
        <AnimatedSection delay={0.08}>
          <RealtimeWidget
            activeVisitors={stats.realtime.active_visitors}
            pageViewsToday={stats.realtime.page_views_today}
            isLoading={loading}
          />
        </AnimatedSection>
      )}

      {/* Overview Cards */}
      {stats && (
        <AnimatedSection delay={0.1}>
          <OverviewCards
            stats={stats.overview}
            isLoading={loading}
          />
        </AnimatedSection>
      )}

      {/* Charts: Row 1 — Page Views & Visitors + Hourly Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedSection delay={0.12}>
          <TimeSeriesChart
            data={stats?.time_series || []}
            isLoading={loading}
          />
        </AnimatedSection>
        <AnimatedSection delay={0.14}>
          <HourlyActivityChart
            data={stats?.hourly_activity || []}
            isLoading={loading}
          />
        </AnimatedSection>
      </div>

      {/* Charts: Row 2 — Top Pages + Visitor Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedSection delay={0.16}>
          <TopPagesChart
            data={stats?.top_pages || []}
            isLoading={loading}
          />
        </AnimatedSection>
        <AnimatedSection delay={0.18}>
          <VisitorGeographyChart
            data={stats?.top_countries || []}
            isLoading={loading}
          />
        </AnimatedSection>
      </div>

      {/* Charts: Row 3 — Traffic Sources + Device Breakdown + Browser + Feature Usage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedSection delay={0.2}>
          <TrafficSourcesChart
            data={stats?.top_referrers || []}
            isLoading={loading}
          />
        </AnimatedSection>
        <AnimatedSection delay={0.22}>
          <DeviceBreakdownChart
            data={stats?.device_breakdown || {}}
            isLoading={loading}
          />
        </AnimatedSection>
        <AnimatedSection delay={0.24}>
          <BrowserBreakdownChart
            data={stats?.browser_breakdown || {}}
            isLoading={loading}
          />
        </AnimatedSection>
        <AnimatedSection delay={0.26}>
          <FeatureUsageChart
            data={stats?.feature_usage || []}
            isLoading={loading}
          />
        </AnimatedSection>
      </div>

      {/* User Acquisition Section */}
      <AnimatedSection delay={0.28}>
        <UserAcquisitionChart
          data={stats?.registrations || []}
          isLoading={loading}
        />
      </AnimatedSection>

      {/* Full loading state when no data yet */}
      {loading && !stats && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 text-neutral-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <p className="text-sm">Loading analytics data...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !stats && !isOffline && (
        <AnimatedSection delay={0.3}>
          <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <BarChart3 className="w-12 h-12 text-neutral-300 mb-4" />
            <h3 className="text-lg font-heading font-medium text-neutral-700 mb-2">No Data Yet</h3>
            <p className="text-sm text-neutral-400 max-w-md">
              Analytics data will appear here once visitors start browsing the site.
              Make sure the analytics server is running.
            </p>
          </div>
        </AnimatedSection>
      )}
    </motion.div>
  )
}
