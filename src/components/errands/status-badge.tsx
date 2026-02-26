import { Badge } from '@/components/ui/badge'
import type { ErrandStatus } from '@/types/errand'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<ErrandStatus, string> = {
  'overdue': 'bg-red-100 text-red-700 hover:bg-red-100',
  'due-today': 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  'due-tomorrow': 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  'due-soon': 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  'on-track': 'bg-green-100 text-green-700 hover:bg-green-100',
}

interface StatusBadgeProps {
  status: ErrandStatus
  label: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge variant="secondary" className={cn(STATUS_STYLES[status], 'font-medium', className)}>
      {label}
    </Badge>
  )
}
