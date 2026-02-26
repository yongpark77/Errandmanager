import { differenceInDays, addMonths, format } from 'date-fns'
import type { Errand, ErrandStatus, ErrandWithStatus, CompletionHistory, CompletionStatus } from '@/types/errand'

export function calculateErrandStatus(errand: Errand, remindDaysBefore: number = 3): ErrandWithStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(errand.next_due + 'T00:00:00')
  const daysUntilDue = differenceInDays(dueDate, today)

  let status: ErrandStatus
  let statusLabel: string

  if (daysUntilDue < 0) {
    status = 'overdue'
    statusLabel = `${Math.abs(daysUntilDue)}d overdue`
  } else if (daysUntilDue === 0) {
    status = 'due-today'
    statusLabel = 'Due today'
  } else if (daysUntilDue === 1) {
    status = 'due-tomorrow'
    statusLabel = 'Due tomorrow'
  } else if (daysUntilDue <= remindDaysBefore) {
    status = 'due-soon'
    statusLabel = `${daysUntilDue}d left`
  } else {
    status = 'on-track'
    statusLabel = `${daysUntilDue}d left`
  }

  return { ...errand, status, statusLabel, daysUntilDue }
}

export function calculateNextDue(completedDate: string, intervalType: string, intervalValue: number): string {
  if (intervalType === 'months') {
    const date = new Date(completedDate + 'T00:00:00')
    const next = addMonths(date, intervalValue)
    return format(next, 'yyyy-MM-dd')
  }
  // miles-based: user manually sets next_due
  return ''
}

export function getCompletionStatus(completedDate: string, scheduledDate: string): CompletionStatus {
  const completed = new Date(completedDate + 'T00:00:00')
  const scheduled = new Date(scheduledDate + 'T00:00:00')
  const daysDiff = differenceInDays(completed, scheduled)

  if (daysDiff > 0) {
    return { type: 'late', label: `${daysDiff}d late`, daysDiff }
  } else if (daysDiff < 0) {
    return { type: 'early', label: `${Math.abs(daysDiff)}d early`, daysDiff }
  }
  return { type: 'on-time', label: 'On time', daysDiff: 0 }
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function getIntervalLabel(type: string, value: number): string {
  if (type === 'miles') return `Every ${value.toLocaleString()} mi`
  if (value === 1) return 'Every month'
  return `Every ${value} months`
}

export function calculateAverageCost(history: CompletionHistory[]): number {
  if (history.length === 0) return 0
  const total = history.reduce((sum, h) => sum + (h.cost || 0), 0)
  return total / history.length
}

export function calculateTotalCost(history: CompletionHistory[]): number {
  return history.reduce((sum, h) => sum + (h.cost || 0), 0)
}
