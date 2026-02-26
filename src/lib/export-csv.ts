import type { Errand } from '@/types/errand'

export function exportErrandsToCSV(errands: Errand[]) {
  const headers = ['Name', 'Category', 'Interval Type', 'Interval Value', 'Next Due', 'Last Completed', 'Estimated Cost', 'Reminders', 'Notes']
  const rows = errands.map((e) => [
    `"${e.name}"`,
    e.category,
    e.interval_type,
    e.interval_value,
    e.next_due,
    e.last_completed ?? '',
    e.estimated_cost,
    e.reminders ? 'Yes' : 'No',
    `"${(e.notes ?? '').replace(/"/g, '""')}"`,
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `errands-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
