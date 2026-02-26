import { CATEGORIES } from './constants'

export const CATEGORY_COLORS: Record<string, string> = {
  vehicle: '#3b82f6',
  home: '#22c55e',
  subscriptions: '#a855f7',
  health: '#ef4444',
  other: '#6b7280',
}

export const COMPLETION_COLORS = {
  'on-time': '#22c55e',
  'late': '#ef4444',
  'early': '#3b82f6',
}

export const chartConfig = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, { label: c.label, color: c.chartColor }])
) as Record<string, { label: string; color: string }>

export const completionChartConfig = {
  'on-time': { label: 'On Time', color: COMPLETION_COLORS['on-time'] },
  'late': { label: 'Late', color: COMPLETION_COLORS['late'] },
  'early': { label: 'Early', color: COMPLETION_COLORS['early'] },
}
