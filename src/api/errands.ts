import { supabase } from '@/lib/supabase'
import type { Errand, ErrandInsert, ErrandUpdate } from '@/types/errand'

export async function fetchErrands(userId: string): Promise<Errand[]> {
  const { data, error } = await supabase
    .from('errands')
    .select('*')
    .eq('user_id', userId)
    .order('next_due', { ascending: true })

  if (error) throw error
  return data
}

export async function fetchErrand(id: string): Promise<Errand> {
  const { data, error } = await supabase
    .from('errands')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createErrand(errand: ErrandInsert): Promise<Errand> {
  const { data, error } = await supabase
    .from('errands')
    .insert(errand)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateErrand(id: string, updates: ErrandUpdate): Promise<Errand> {
  const { data, error } = await supabase
    .from('errands')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteErrand(id: string): Promise<void> {
  const { error } = await supabase
    .from('errands')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function completeErrand(
  errandId: string,
  userId: string,
  data: {
    completedDate: string
    scheduledDate: string
    cost: number
    notes: string
    nextDue: string
    estimatedCost?: number
  }
): Promise<void> {
  // Insert completion history
  const { error: historyError } = await supabase
    .from('completion_history')
    .insert({
      errand_id: errandId,
      user_id: userId,
      completed_date: data.completedDate,
      scheduled_date: data.scheduledDate,
      cost: data.cost,
      notes: data.notes || null,
    })

  if (historyError) throw historyError

  // Update errand
  const updates: ErrandUpdate = {
    last_completed: data.completedDate,
    next_due: data.nextDue,
  }
  if (data.estimatedCost !== undefined) {
    updates.estimated_cost = data.estimatedCost
  }

  const { error: errandError } = await supabase
    .from('errands')
    .update(updates)
    .eq('id', errandId)

  if (errandError) throw errandError
}

export async function deleteMultipleErrands(ids: string[]): Promise<void> {
  const { error } = await supabase
    .from('errands')
    .delete()
    .in('id', ids)

  if (error) throw error
}
