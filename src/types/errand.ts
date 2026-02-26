import type { Database } from './supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Errand = Database['public']['Tables']['errands']['Row']
export type ErrandInsert = Database['public']['Tables']['errands']['Insert']
export type ErrandUpdate = Database['public']['Tables']['errands']['Update']

export type CompletionHistory = Database['public']['Tables']['completion_history']['Row']
export type CompletionHistoryInsert = Database['public']['Tables']['completion_history']['Insert']

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
