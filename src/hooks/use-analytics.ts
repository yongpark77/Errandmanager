import { useMemo } from 'react'
import { subMonths, startOfMonth, endOfMonth, format, isWithinInterval } from 'date-fns'
import type { CompletionHistory, Errand } from '@/types/errand'
import { getCompletionStatus } from '@/lib/errand-utils'
import { CATEGORY_COLORS } from '@/lib/chart-config'

export type PeriodKey = '30d' | '3m' | '6m' | '12m'

function getDateRange(period: PeriodKey) {
  const now = new Date()
  const monthsBack = period === '30d' ? 1 : period === '3m' ? 3 : period === '6m' ? 6 : 12
  return {
    start: startOfMonth(subMonths(now, monthsBack)),
    end: endOfMonth(now),
    months: monthsBack,
  }
}

export function useAnalyticsData(history: CompletionHistory[] | undefined, errands: Errand[] | undefined, period: PeriodKey) {
  return useMemo(() => {
    if (!history || !errands) return null

    const range = getDateRange(period)

    const filteredHistory = history.filter((h) => {
      const d = new Date(h.completed_date + 'T00:00:00')
      return isWithinInterval(d, { start: range.start, end: range.end })
    })

    // Monthly spend data (stacked by category)
    const monthlySpend: Record<string, Record<string, number>> = {}
    filteredHistory.forEach((h) => {
      const errand = errands.find((e) => e.id === h.errand_id)
      if (!errand) return
      const month = format(new Date(h.completed_date + 'T00:00:00'), 'yyyy-MM')
      if (!monthlySpend[month]) monthlySpend[month] = {}
      monthlySpend[month][errand.category] = (monthlySpend[month][errand.category] || 0) + h.cost
    })

    const monthlySpendData = Object.entries(monthlySpend)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, cats]) => ({
        month: format(new Date(month + '-01'), 'MMM'),
        fullMonth: month,
        ...cats,
        total: Object.values(cats).reduce((s, v) => s + v, 0),
      }))

    // Category cost distribution
    const categoryCosts: Record<string, number> = {}
    filteredHistory.forEach((h) => {
      const errand = errands.find((e) => e.id === h.errand_id)
      if (!errand) return
      categoryCosts[errand.category] = (categoryCosts[errand.category] || 0) + h.cost
    })

    const categoryDonutData = Object.entries(categoryCosts)
      .filter(([, v]) => v > 0)
      .map(([cat, cost]) => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        value: cost,
        fill: CATEGORY_COLORS[cat] || '#6b7280',
      }))

    // Top 5 errands by cost
    const errandCosts: Record<string, { name: string; total: number }> = {}
    filteredHistory.forEach((h) => {
      const errand = errands.find((e) => e.id === h.errand_id)
      if (!errand) return
      if (!errandCosts[errand.id]) errandCosts[errand.id] = { name: errand.name, total: 0 }
      errandCosts[errand.id].total += h.cost
    })
    const topErrands = Object.values(errandCosts)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    // Completion statuses
    const completionStatuses = filteredHistory.map((h) => getCompletionStatus(h.completed_date, h.scheduled_date))
    const onTimeCount = completionStatuses.filter((s) => s.type === 'on-time').length
    const lateCount = completionStatuses.filter((s) => s.type === 'late').length
    const earlyCount = completionStatuses.filter((s) => s.type === 'early').length
    const totalCompletions = filteredHistory.length

    // Completion donut
    const completionDonutData = [
      { name: 'On Time', value: onTimeCount, fill: '#22c55e' },
      { name: 'Late', value: lateCount, fill: '#ef4444' },
      { name: 'Early', value: earlyCount, fill: '#3b82f6' },
    ].filter((d) => d.value > 0)

    // Monthly completion rate
    const monthlyCompletion: Record<string, { total: number; completed: number }> = {}
    filteredHistory.forEach((h) => {
      const month = format(new Date(h.completed_date + 'T00:00:00'), 'yyyy-MM')
      if (!monthlyCompletion[month]) monthlyCompletion[month] = { total: 0, completed: 0 }
      monthlyCompletion[month].total++
      monthlyCompletion[month].completed++
    })
    const monthlyCompletionData = Object.entries(monthlyCompletion)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: format(new Date(month + '-01'), 'MMM'),
        rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }))

    // Category completion breakdown
    const categoryCompletion: Record<string, { onTime: number; late: number; early: number }> = {}
    filteredHistory.forEach((h) => {
      const errand = errands.find((e) => e.id === h.errand_id)
      if (!errand) return
      if (!categoryCompletion[errand.category]) categoryCompletion[errand.category] = { onTime: 0, late: 0, early: 0 }
      const status = getCompletionStatus(h.completed_date, h.scheduled_date)
      if (status.type === 'on-time') categoryCompletion[errand.category].onTime++
      else if (status.type === 'late') categoryCompletion[errand.category].late++
      else categoryCompletion[errand.category].early++
    })
    const categoryCompletionData = Object.entries(categoryCompletion).map(([cat, data]) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      ...data,
    }))

    // Cost matrix
    const costMatrix: Record<string, Record<string, number>> = {}
    filteredHistory.forEach((h) => {
      const errand = errands.find((e) => e.id === h.errand_id)
      if (!errand) return
      const month = format(new Date(h.completed_date + 'T00:00:00'), 'MMM yyyy')
      if (!costMatrix[month]) costMatrix[month] = {}
      costMatrix[month][errand.category] = (costMatrix[month][errand.category] || 0) + h.cost
    })

    // KPIs
    const totalSpent = filteredHistory.reduce((s, h) => s + h.cost, 0)
    const avgMonthly = range.months > 0 ? totalSpent / range.months : totalSpent
    const completionRate = totalCompletions > 0 ? Math.round((onTimeCount / totalCompletions) * 100) : 0
    const lateDays = completionStatuses.filter((s) => s.type === 'late').map((s) => s.daysDiff)
    const avgDelay = lateDays.length > 0 ? lateDays.reduce((s, d) => s + d, 0) / lateDays.length : 0

    // Previous period for comparison
    const prevRange = {
      start: subMonths(range.start, range.months),
      end: range.start,
    }
    const prevHistory = history.filter((h) => {
      const d = new Date(h.completed_date + 'T00:00:00')
      return isWithinInterval(d, { start: prevRange.start, end: prevRange.end })
    })
    const prevTotalSpent = prevHistory.reduce((s, h) => s + h.cost, 0)
    const prevAvgMonthly = range.months > 0 ? prevTotalSpent / range.months : prevTotalSpent
    const prevStatuses = prevHistory.map((h) => getCompletionStatus(h.completed_date, h.scheduled_date))
    const prevOnTime = prevStatuses.filter((s) => s.type === 'on-time').length
    const prevCompRate = prevHistory.length > 0 ? Math.round((prevOnTime / prevHistory.length) * 100) : 0

    const spentChange = prevTotalSpent > 0 ? ((totalSpent - prevTotalSpent) / prevTotalSpent) * 100 : 0
    const avgChange = prevAvgMonthly > 0 ? ((avgMonthly - prevAvgMonthly) / prevAvgMonthly) * 100 : 0
    const rateChange = prevCompRate > 0 ? completionRate - prevCompRate : 0

    return {
      monthlySpendData,
      categoryDonutData,
      topErrands,
      completionDonutData,
      monthlyCompletionData,
      categoryCompletionData,
      costMatrix,
      totalSpent,
      avgMonthly,
      completionRate,
      avgDelay,
      totalCompletions,
      spentChange,
      avgChange,
      rateChange,
    }
  }, [history, errands, period])
}
