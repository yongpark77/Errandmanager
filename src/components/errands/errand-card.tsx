import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CategoryIcon } from './category-icon'
import { StatusBadge } from './status-badge'
import { formatDate } from '@/lib/date-utils'
import { getIntervalLabel, formatCurrency } from '@/lib/errand-utils'
import type { ErrandWithStatus } from '@/types/errand'
import { CheckCircle, Pencil, Trash2 } from 'lucide-react'

interface ErrandCardProps {
  errand: ErrandWithStatus
  onComplete?: () => void
  onDelete?: () => void
  selected?: boolean
  onSelect?: (checked: boolean) => void
}

export function ErrandCard({ errand, onComplete, onDelete, selected, onSelect }: ErrandCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${selected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => navigate(`/errands/${errand.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation()
                onSelect(e.target.checked)
              }}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
          )}
          <CategoryIcon category={errand.category} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium truncate">{errand.name}</h3>
              <StatusBadge status={errand.status} label={errand.statusLabel} />
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span>{getIntervalLabel(errand.interval_type, errand.interval_value)}</span>
              <span>Due {formatDate(errand.next_due)}</span>
            </div>
            {errand.estimated_cost > 0 && (
              <p className="text-sm text-muted-foreground mt-1">{formatCurrency(errand.estimated_cost)}</p>
            )}
          </div>
        </div>
        {(onComplete || onDelete) && (
          <div className="flex items-center gap-1 mt-3 justify-end" onClick={(e) => e.stopPropagation()}>
            {onComplete && (
              <Button variant="ghost" size="sm" onClick={onComplete}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate(`/edit/${errand.id}`)}>
              <Pencil className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
