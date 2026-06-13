// app/dashboard/admin/analytics/types.ts

export interface AnalyticsStats {
  realtime: {
    active_visitors: number
    page_views_today: number
  }
  overview: {
    total_page_views: number
    unique_visitors: number
    avg_time_on_site_seconds: number | null
  }
  time_series: Array<{
    date: string
    page_views: number
    visitors: number
  }>
  top_pages: Array<{
    path: string
    views: number
  }>
  top_countries: Array<{
    country: string
    visitors: number
  }>
  top_referrers: Array<{
    source: string
    visits: number
  }>
  device_breakdown: Record<string, number>
  browser_breakdown: Record<string, number>
  feature_usage: Array<{
    event_name: string
    count: number
  }>
  hourly_activity: number[]
  registrations: Array<{
    date: string
    count: number
  }>
}

export type TimeRange = 'today' | '24h' | '7d' | '30d' | 'all'

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  today: 'Today',
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  all: 'All Time',
}
