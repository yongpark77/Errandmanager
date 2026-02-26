import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db, isMock } from '@/lib/firebase'
import { mockDb } from '@/lib/mock-data'
import type { Profile, ProfileUpdate } from '@/types/errand'

export async function fetchProfile(userId: string): Promise<Profile> {
  if (isMock) {
    const profile = mockDb.getOne<Profile>('profiles', userId)
    if (!profile) throw new Error('Profile not found')
    return profile
  }
  const snap = await getDoc(doc(db!, 'profiles', userId))
  if (!snap.exists()) throw new Error('Profile not found')
  return { id: snap.id, ...snap.data() } as Profile
}

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
  if (isMock) {
    const result = mockDb.update<Profile>('profiles', userId, updates as Record<string, unknown>)
    if (!result) throw new Error('Profile not found')
    return result
  }
  const ref = doc(db!, 'profiles', userId)
  await updateDoc(ref, { ...updates, updated_at: new Date().toISOString() })
  const snap = await getDoc(ref)
  return { id: snap.id, ...snap.data() } as Profile
}
