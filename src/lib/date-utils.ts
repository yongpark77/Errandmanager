import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, isToday, isSameMonth, isSameDay } from 'date-fns'

export { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, isToday, isSameMonth, isSameDay }

export function formatDate(dateStr: string, fmt: string = 'MMM d, yyyy'): string {
  return format(new Date(dateStr + 'T00:00:00'), fmt)
}

export function formatShortDate(dateStr: string): string {
  return format(new Date(dateStr + 'T00:00:00'), 'MMM d')
}

export function formatMonthYear(dateStr: string): string {
  return format(new Date(dateStr + 'T00:00:00'), 'MMMM yyyy')
}

export function getMonthLabel(date: Date): string {
  return format(date, 'MMM')
}

export function getMonthYearLabel(date: Date): string {
  return format(date, 'MMMM yyyy')
}

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
