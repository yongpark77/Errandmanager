import { supabase } from '@/lib/supabase'
import type { CompletionHistory } from '@/types/errand'

export async function fetchCompletionHistory(errandId: string): Promise<CompletionHistory[]> {
  const { data, error } = await supabase
    .from('completion_history')
    .select('*')
    .eq('errand_id', errandId)
    .order('completed_date', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchAllCompletionHistory(userId: string): Promise<CompletionHistory[]> {
  const { data, error } = await supabase
    .from('completion_history')
    .select('*')
    .eq('user_id', userId)
    .order('completed_date', { ascending: false })

  if (error) throw error
  return data
}

export async function deleteCompletionRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('completion_history')
    .delete()
    .eq('id', id)

  if (error) throw error
}
