import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { todayString } from '@/lib/date-utils'
import { calculateNextDue } from '@/lib/errand-utils'
import type { Errand } from '@/types/errand'

interface CompleteDialogProps {
  errand: Errand
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: {
    completedDate: string
    cost: number
    notes: string
    nextDue: string
    estimatedCost?: number
  }) => void
  loading?: boolean
}

export function CompleteDialog({ errand, open, onOpenChange, onConfirm, loading }: CompleteDialogProps) {
  const [completedDate, setCompletedDate] = useState(todayString())
  const [cost, setCost] = useState(errand.estimated_cost?.toString() || '')
  const [notes, setNotes] = useState('')

  const handleConfirm = () => {
    const costNum = parseFloat(cost) || 0
    const nextDue = calculateNextDue(completedDate, errand.interval_type, errand.interval_value)
    onConfirm({
      completedDate,
      cost: costNum,
      notes,
      nextDue: nextDue || errand.next_due,
      estimatedCost: costNum > 0 ? costNum : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Completed</DialogTitle>
          <DialogDescription>
            Record completion for "{errand.name}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="completedDate">Completed Date</Label>
            <Input
              id="completedDate"
              type="date"
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Cost ($)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this completion..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
