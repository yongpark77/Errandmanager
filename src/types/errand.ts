export interface Profile {
  id: string
  name: string
  remind_days_before: number
  created_at: string
  updated_at: string
}

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>

export interface Errand {
  id: string
  user_id: string
  name: string
  description: string | null
  category: 'vehicle' | 'home' | 'subscriptions' | 'health' | 'other'
  interval_type: 'months' | 'miles'
  interval_value: number
  next_due: string
  last_completed: string | null
  estimated_cost: number
  reminders: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export type ErrandInsert = Omit<Errand, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type ErrandUpdate = Partial<Omit<Errand, 'id' | 'created_at'>>

export interface CompletionHistory {
  id: string
  errand_id: string
  user_id: string
  completed_date: string
  scheduled_date: string
  cost: number
  notes: string | null
  created_at: string
}

export type CompletionHistoryInsert = Omit<CompletionHistory, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type ErrandCategory = Errand['category']
export type IntervalType = Errand['interval_type']

export type ErrandStatus = 'overdue' | 'due-today' | 'due-tomorrow' | 'due-soon' | 'on-track'

export interface ErrandWithStatus extends Errand {
  status: ErrandStatus
  statusLabel: string
  daysUntilDue: number
}

export interface CompletionStatus {
  type: 'on-time' | 'late' | 'early'
  label: string
  daysDiff: number
}
