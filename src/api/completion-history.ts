import { collection, doc, query, where, getDocs, deleteDoc } from 'firebase/firestore'
import { db, isMock } from '@/lib/firebase'
import { mockDb } from '@/lib/mock-data'
import type { CompletionHistory } from '@/types/errand'

export async function fetchCompletionHistory(errandId: string): Promise<CompletionHistory[]> {
  if (isMock) {
    return mockDb.getAll<CompletionHistory>('completion_history', [{ field: 'errand_id', value: errandId }], { field: 'completed_date', direction: 'desc' })
  }
  const q = query(collection(db!, 'completion_history'), where('errand_id', '==', errandId))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as CompletionHistory)
    .sort((a, b) => b.completed_date.localeCompare(a.completed_date))
}

export async function fetchAllCompletionHistory(userId: string): Promise<CompletionHistory[]> {
  if (isMock) {
    return mockDb.getAll<CompletionHistory>('completion_history', [{ field: 'user_id', value: userId }], { field: 'completed_date', direction: 'desc' })
  }
  const q = query(collection(db!, 'completion_history'), where('user_id', '==', userId))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as CompletionHistory)
    .sort((a, b) => b.completed_date.localeCompare(a.completed_date))
}

export async function deleteCompletionRecord(id: string): Promise<void> {
  if (isMock) {
    mockDb.remove('completion_history', id)
    return
  }
  await deleteDoc(doc(db!, 'completion_history', id))
}
