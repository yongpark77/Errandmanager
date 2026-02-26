import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, isMock } from '@/lib/firebase'
import { mockAuth, mockDb } from '@/lib/mock-data'
import type { Profile } from '@/types/errand'

interface AppUser {
  id: string
  email: string | null
}

interface AuthContextType {
  user: AppUser | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    if (isMock) {
      const p = mockDb.getOne<Profile>('profiles', userId)
      setProfile(p)
      return
    }
    const snap = await getDoc(doc(db!, 'profiles', userId))
    if (snap.exists()) {
      setProfile({ id: snap.id, ...snap.data() } as Profile)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    if (isMock) {
      const unsubscribe = mockAuth.onAuthStateChanged((mockUser) => {
        if (mockUser) {
          setUser({ id: mockUser.id, email: mockUser.email })
          fetchProfile(mockUser.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      })
      return unsubscribe
    }

    const unsubscribe = onAuthStateChanged(auth!, (firebaseUser) => {
      if (firebaseUser) {
        const appUser: AppUser = { id: firebaseUser.uid, email: firebaseUser.email }
        setUser(appUser)
        fetchProfile(firebaseUser.uid)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [fetchProfile])

  const signIn = async (email: string, password: string) => {
    try {
      if (isMock) {
        await mockAuth.signIn(email, password)
        return { error: null }
      }
      await signInWithEmailAndPassword(auth!, email, password)
      return { error: null }
    } catch (e) {
      return { error: e as Error }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      if (isMock) {
        await mockAuth.signUp(email, password, name)
        return { error: null }
      }
      const cred = await createUserWithEmailAndPassword(auth!, email, password)
      await updateFirebaseProfile(cred.user, { displayName: name })
      const now = new Date().toISOString()
      await setDoc(doc(db!, 'profiles', cred.user.uid), {
        name,
        remind_days_before: 3,
        created_at: now,
        updated_at: now,
      })
      return { error: null }
    } catch (e) {
      return { error: e as Error }
    }
  }

  const handleSignOut = async () => {
    if (isMock) {
      await mockAuth.signOut()
    } else {
      await firebaseSignOut(auth!)
    }
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut: handleSignOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
