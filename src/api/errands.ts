import {
  collection, doc, query, where,
  getDocs, getDoc, setDoc, updateDoc, writeBatch,
} from 'firebase/firestore'
import { db, isMock } from '@/lib/firebase'
import { mockDb } from '@/lib/mock-data'
import type { Errand, ErrandInsert, ErrandUpdate } from '@/types/errand'

export async function fetchErrands(userId: string): Promise<Errand[]> {
  if (isMock) {
    return mockDb.getAll<Errand>('errands', [{ field: 'user_id', value: userId }], { field: 'next_due', direction: 'asc' })
  }
  const q = query(collection(db!, 'errands'), where('user_id', '==', userId))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Errand)
    .sort((a, b) => a.next_due.localeCompare(b.next_due))
}

export async function fetchErrand(id: string): Promise<Errand> {
  if (isMock) {
    const errand = mockDb.getOne<Errand>('errands', id)
    if (!errand) throw new Error('Errand not found')
    return errand
  }
  const snap = await getDoc(doc(db!, 'errands', id))
  if (!snap.exists()) throw new Error('Errand not found')
  return { id: snap.id, ...snap.data() } as Errand
}

export async function createErrand(errand: ErrandInsert): Promise<Errand> {
  if (isMock) {
    return mockDb.insert<Errand>('errands', errand as Record<string, unknown>)
  }
  const ref = doc(collection(db!, 'errands'))
  const now = new Date().toISOString()
  const data = { ...errand, created_at: now, updated_at: now }
  await setDoc(ref, data)
  return { id: ref.id, ...data } as Errand
}

export async function updateErrand(id: string, updates: ErrandUpdate): Promise<Errand> {
  if (isMock) {
    const result = mockDb.update<Errand>('errands', id, updates as Record<string, unknown>)
    if (!result) throw new Error('Errand not found')
    return result
  }
  const ref = doc(db!, 'errands', id)
  await updateDoc(ref, { ...updates, updated_at: new Date().toISOString() })
  const snap = await getDoc(ref)
  return { id: snap.id, ...snap.data() } as Errand
}

export async function deleteErrand(id: string): Promise<void> {
  if (isMock) {
    mockDb.remove('errands', id)
    mockDb.removeWhere('completion_history', [{ field: 'errand_id', value: id }])
    return
  }
  const histQ = query(collection(db!, 'completion_history'), where('errand_id', '==', id))
  const histSnap = await getDocs(histQ)
  const batch = writeBatch(db!)
  histSnap.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(doc(db!, 'errands', id))
  await batch.commit()
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
  const historyData = {
    errand_id: errandId,
    user_id: userId,
    completed_date: data.completedDate,
    scheduled_date: data.scheduledDate,
    cost: data.cost,
    notes: data.notes || null,
  }

  const errandUpdates: ErrandUpdate = {
    last_completed: data.completedDate,
    next_due: data.nextDue,
  }
  if (data.estimatedCost !== undefined) {
    errandUpdates.estimated_cost = data.estimatedCost
  }

  if (isMock) {
    mockDb.insert('completion_history', historyData)
    mockDb.update('errands', errandId, errandUpdates as Record<string, unknown>)
    return
  }

  const batch = writeBatch(db!)
  const histRef = doc(collection(db!, 'completion_history'))
  const now = new Date().toISOString()
  batch.set(histRef, { ...historyData, created_at: now })
  batch.update(doc(db!, 'errands', errandId), { ...errandUpdates, updated_at: now })
  await batch.commit()
}

export async function deleteMultipleErrands(ids: string[]): Promise<void> {
  if (isMock) {
    mockDb.removeByIds('errands', ids)
    ids.forEach((id) => mockDb.removeWhere('completion_history', [{ field: 'errand_id', value: id }]))
    return
  }
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100)
    const batch = writeBatch(db!)
    for (const id of chunk) {
      const histQ = query(collection(db!, 'completion_history'), where('errand_id', '==', id))
      const histSnap = await getDocs(histQ)
      histSnap.docs.forEach((d) => batch.delete(d.ref))
      batch.delete(doc(db!, 'errands', id))
    }
    await batch.commit()
  }
}

export async function deleteAllErrands(userId: string): Promise<void> {
  if (isMock) {
    mockDb.removeWhere('errands', [{ field: 'user_id', value: userId }])
    mockDb.removeWhere('completion_history', [{ field: 'user_id', value: userId }])
    return
  }
  const errandSnap = await getDocs(query(collection(db!, 'errands'), where('user_id', '==', userId)))
  for (let i = 0; i < errandSnap.docs.length; i += 499) {
    const batch = writeBatch(db!)
    errandSnap.docs.slice(i, i + 499).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
  const histSnap = await getDocs(query(collection(db!, 'completion_history'), where('user_id', '==', userId)))
  for (let i = 0; i < histSnap.docs.length; i += 499) {
    const batch = writeBatch(db!)
    histSnap.docs.slice(i, i + 499).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
}
