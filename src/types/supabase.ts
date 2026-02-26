export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          remind_days_before: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          remind_days_before?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          remind_days_before?: number
          created_at?: string
          updated_at?: string
        }
      }
      errands: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          category: 'vehicle' | 'home' | 'subscriptions' | 'health' | 'other'
          interval_type: 'months' | 'miles'
          interval_value: number
          next_due: string
          last_completed?: string | null
          estimated_cost?: number
          reminders?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          category?: 'vehicle' | 'home' | 'subscriptions' | 'health' | 'other'
          interval_type?: 'months' | 'miles'
          interval_value?: number
          next_due?: string
          last_completed?: string | null
          estimated_cost?: number
          reminders?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      completion_history: {
        Row: {
          id: string
          errand_id: string
          user_id: string
          completed_date: string
          scheduled_date: string
          cost: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          errand_id: string
          user_id: string
          completed_date: string
          scheduled_date: string
          cost?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          errand_id?: string
          user_id?: string
          completed_date?: string
          scheduled_date?: string
          cost?: number
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}
