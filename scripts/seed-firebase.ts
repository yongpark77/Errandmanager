/**
 * Seed script: creates a test account and 10 errands + completion history in Firebase.
 *
 * Usage:
 *   1. Place your Firebase service account JSON as `service-account.json` in the project root.
 *   2. Run: npm run seed
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ---- Config -------------------------------------------------------------------

const TEST_EMAIL = 'epark@gogogle.com'
const TEST_PASSWORD = 'demo1234'
const TEST_DISPLAY_NAME = 'Ethan Park'

// ---- Init Firebase Admin ------------------------------------------------------

const saPath = resolve(import.meta.dirname, '..', 'service-account.json')
let serviceAccount: ServiceAccount
try {
  serviceAccount = JSON.parse(readFileSync(saPath, 'utf-8')) as ServiceAccount
} catch {
  console.error('Could not read service-account.json at', saPath)
  console.error('Download it from Firebase Console > Project Settings > Service accounts')
  process.exit(1)
}

const app = initializeApp({ credential: cert(serviceAccount) })
const authAdmin = getAuth(app)
const db = getFirestore(app)

// ---- Helpers ------------------------------------------------------------------

const today = new Date()
const daysFromNow = (d: number) => {
  const t = new Date(today)
  t.setDate(t.getDate() + d)
  return t.toISOString().split('T')[0]
}
const daysAgo = (d: number) => daysFromNow(-d)
const monthsAgo = (m: number) => {
  const d = new Date(today)
  d.setMonth(d.getMonth() - m)
  return d.toISOString().split('T')[0]
}

// ---- Seed Data ----------------------------------------------------------------

interface SeedErrand {
  name: string
  description: string
  category: 'vehicle' | 'home' | 'subscriptions' | 'health' | 'other'
  interval_type: 'months' | 'miles'
  interval_value: number
  next_due: string
  last_completed: string | null
  estimated_cost: number
  reminders: boolean
  notes: string | null
}

const errands: SeedErrand[] = [
  {
    name: 'Oil Change',
    description: 'Full synthetic oil change for the car',
    category: 'vehicle',
    interval_type: 'months',
    interval_value: 6,
    next_due: daysFromNow(5),
    last_completed: daysAgo(175),
    estimated_cost: 75,
    reminders: true,
    notes: null,
  },
  {
    name: 'HVAC Filter',
    description: 'Replace home HVAC air filter',
    category: 'home',
    interval_type: 'months',
    interval_value: 3,
    next_due: daysFromNow(-2),
    last_completed: daysAgo(92),
    estimated_cost: 25,
    reminders: true,
    notes: 'Use MERV-13 filter',
  },
  {
    name: 'Tire Rotation',
    description: 'Rotate tires every 7,500 miles',
    category: 'vehicle',
    interval_type: 'miles',
    interval_value: 7500,
    next_due: daysFromNow(30),
    last_completed: daysAgo(120),
    estimated_cost: 40,
    reminders: true,
    notes: null,
  },
  {
    name: 'Netflix Subscription',
    description: 'Monthly streaming subscription',
    category: 'subscriptions',
    interval_type: 'months',
    interval_value: 1,
    next_due: daysFromNow(12),
    last_completed: daysAgo(18),
    estimated_cost: 15.99,
    reminders: false,
    notes: null,
  },
  {
    name: 'Dental Checkup',
    description: 'Routine dental cleaning and checkup',
    category: 'health',
    interval_type: 'months',
    interval_value: 6,
    next_due: daysFromNow(0),
    last_completed: daysAgo(180),
    estimated_cost: 150,
    reminders: true,
    notes: 'Dr. Smith at Main Street Dental',
  },
  {
    name: 'Gutter Cleaning',
    description: 'Clean out rain gutters',
    category: 'home',
    interval_type: 'months',
    interval_value: 6,
    next_due: daysFromNow(45),
    last_completed: daysAgo(135),
    estimated_cost: 200,
    reminders: true,
    notes: null,
  },
  {
    name: 'Car Insurance Renewal',
    description: 'Annual car insurance policy renewal',
    category: 'vehicle',
    interval_type: 'months',
    interval_value: 12,
    next_due: daysFromNow(60),
    last_completed: daysAgo(305),
    estimated_cost: 1200,
    reminders: true,
    notes: 'Compare quotes before renewal',
  },
  {
    name: 'Gym Membership',
    description: 'Monthly gym membership payment',
    category: 'subscriptions',
    interval_type: 'months',
    interval_value: 1,
    next_due: daysFromNow(8),
    last_completed: daysAgo(22),
    estimated_cost: 49.99,
    reminders: false,
    notes: null,
  },
  {
    name: 'Annual Physical',
    description: 'Yearly comprehensive health checkup',
    category: 'health',
    interval_type: 'months',
    interval_value: 12,
    next_due: daysFromNow(90),
    last_completed: daysAgo(275),
    estimated_cost: 250,
    reminders: true,
    notes: 'Fasting required for blood work',
  },
  {
    name: 'Smoke Detector Battery',
    description: 'Replace batteries in all smoke detectors',
    category: 'home',
    interval_type: 'months',
    interval_value: 6,
    next_due: daysFromNow(20),
    last_completed: daysAgo(160),
    estimated_cost: 15,
    reminders: true,
    notes: 'Check all 5 detectors',
  },
]

// ---- Main ---------------------------------------------------------------------

async function main() {
  console.log('Starting Firebase seed...\n')

  // 1. Create (or find) the test user
  let uid: string
  try {
    const existing = await authAdmin.getUserByEmail(TEST_EMAIL)
    uid = existing.uid
    console.log(`User already exists: ${TEST_EMAIL} (${uid})`)
  } catch {
    const newUser = await authAdmin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      displayName: TEST_DISPLAY_NAME,
    })
    uid = newUser.uid
    console.log(`Created user: ${TEST_EMAIL} (${uid})`)
  }

  // 2. Create profile document
  const now = new Date().toISOString()
  await db.doc(`profiles/${uid}`).set({
    name: TEST_DISPLAY_NAME,
    remind_days_before: 3,
    created_at: now,
    updated_at: now,
  })
  console.log('Created profile document')

  // 3. Create errands
  const errandIds: string[] = []
  const batch = db.batch()

  for (const errand of errands) {
    const ref = db.collection('errands').doc()
    errandIds.push(ref.id)
    batch.set(ref, {
      user_id: uid,
      ...errand,
      created_at: now,
      updated_at: now,
    })
  }

  await batch.commit()
  console.log(`Created ${errands.length} errands`)

  // 4. Create completion history (1-3 records per month-based errand)
  let historyCount = 0
  const histBatch = db.batch()

  for (let i = 0; i < errands.length; i++) {
    const errand = errands[i]
    if (errand.interval_type === 'miles') continue

    const completions = Math.min(3, Math.floor(12 / errand.interval_value))
    for (let j = 1; j <= completions; j++) {
      const scheduled = monthsAgo(j * errand.interval_value)
      const dayOffset = Math.floor(Math.random() * 5) - 2
      const completedDate = new Date(scheduled + 'T00:00:00')
      completedDate.setDate(completedDate.getDate() + dayOffset)
      const completed = completedDate.toISOString().split('T')[0]

      const ref = db.collection('completion_history').doc()
      histBatch.set(ref, {
        errand_id: errandIds[i],
        user_id: uid,
        completed_date: completed,
        scheduled_date: scheduled,
        cost: Math.round(errand.estimated_cost * (0.8 + Math.random() * 0.4) * 100) / 100,
        notes: null,
        created_at: now,
      })
      historyCount++
    }
  }

  await histBatch.commit()
  console.log(`Created ${historyCount} completion history records`)

  console.log('\nSeed complete!')
  console.log(`Login with: ${TEST_EMAIL} / ${TEST_PASSWORD}`)

  process.exit(0)
}

main().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})
