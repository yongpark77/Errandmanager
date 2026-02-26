import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { CATEGORIES } from '@/lib/constants'
import type { Errand, ErrandInsert } from '@/types/errand'

interface ErrandFormProps {
  initialData?: Errand
  onSubmit: (data: Omit<ErrandInsert, 'user_id'>) => void
  onCancel: () => void
  submitLabel: string
  loading?: boolean
}

export function ErrandForm({ initialData, onSubmit, onCancel, submitLabel, loading }: ErrandFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [category, setCategory] = useState(initialData?.category ?? 'other')
  const [intervalType, setIntervalType] = useState(initialData?.interval_type ?? 'months')
  const [intervalValue, setIntervalValue] = useState(initialData?.interval_value?.toString() ?? '3')
  const [lastCompleted, setLastCompleted] = useState(initialData?.last_completed ?? '')
  const [nextDue, setNextDue] = useState(initialData?.next_due ?? '')
  const [estimatedCost, setEstimatedCost] = useState(initialData?.estimated_cost?.toString() ?? '')
  const [reminders, setReminders] = useState(initialData?.reminders ?? true)
  const [notes, setNotes] = useState(initialData?.notes ?? '')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      description: description || null,
      category: category as ErrandInsert['category'],
      interval_type: intervalType as ErrandInsert['interval_type'],
      interval_value: parseInt(intervalValue) || 3,
      last_completed: lastCompleted || null,
      next_due: nextDue,
      estimated_cost: parseFloat(estimatedCost) || 0,
      reminders,
      notes: notes || null,
    })
  }

  const isValid = name.trim() && category && nextDue && intervalValue

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Errand Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Oil Change"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
          />
        </div>

        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Interval Type *</Label>
          <RadioGroup value={intervalType} onValueChange={(v) => setIntervalType(v as typeof intervalType)} className="flex gap-4 pt-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="months" id="months" />
              <Label htmlFor="months" className="font-normal cursor-pointer">Months</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="miles" id="miles" />
              <Label htmlFor="miles" className="font-normal cursor-pointer">Miles</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="intervalValue">
            Interval Value * {intervalType === 'miles' ? '(miles)' : '(months)'}
          </Label>
          <Input
            id="intervalValue"
            type="number"
            min="1"
            value={intervalValue}
            onChange={(e) => setIntervalValue(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
          <Input
            id="estimatedCost"
            type="number"
            step="0.01"
            min="0"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastCompleted">Last Completed</Label>
          <Input
            id="lastCompleted"
            type="date"
            value={lastCompleted}
            onChange={(e) => setLastCompleted(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextDue">Next Due *</Label>
          <Input
            id="nextDue"
            type="date"
            value={nextDue}
            onChange={(e) => setNextDue(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="reminders"
            checked={reminders}
            onCheckedChange={setReminders}
          />
          <Label htmlFor="reminders" className="cursor-pointer">Enable Reminders</Label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid || loading}>
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
