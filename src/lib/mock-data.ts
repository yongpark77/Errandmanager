// Mock data layer for local development without Firebase.
// Stores data in localStorage and provides simple CRUD helpers.

const genId = () => crypto.randomUUID()

const DEMO_USER_ID = 'demo-user-id-001'
const STORAGE_KEY = 'mock-firebase-db'

// ---- Seed data ----------------------------------------------------------------

function seedData(): Record<string, Record<string, unknown>[]> {
  const now = new Date().toISOString()
  const today = new Date()

  const daysFromNow = (d: number) => {
    const t = new Date(today)
    t.setDate(t.getDate() + d)
    return t.toISOString().split('T')[0]
  }

  const daysAgo = (d: number) => daysFromNow(-d)

  return {
    profiles: [
      {
        id: DEMO_USER_ID,
        name: 'Demo User',
        remind_days_before: 3,
        created_at: now,
        updated_at: now,
      },
    ],
    errands: [
      {
        id: genId(),
        user_id: DEMO_USER_ID,
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
        created_at: now,
        updated_at: now,
      },
      {
        id: genId(),
        user_id: DEMO_USER_ID,
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
        created_at: now,
        updated_at: now,
      },
      {
        id: genId(),
        user_id: DEMO_USER_ID,
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
        created_at: now,
        updated_at: now,
      },
      {
        id: genId(),
        user_id: DEMO_USER_ID,
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
        created_at: now,
        updated_at: now,
      },
      {
        id: genId(),
        user_id: DEMO_USER_ID,
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
        created_at: now,
        updated_at: now,
      },
      {
        id: genId(),
        user_id: DEMO_USER_ID,
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
        created_at: now,
        updated_at: now,
      },
    ],
    completion_history: [] as Record<string, unknown>[],
  }
}

function buildCompletionHistory(errands: Record<string, unknown>[]): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = []
  const now = new Date()

  const monthsAgo = (m: number) => {
    const d = new Date(now)
    d.setMonth(d.getMonth() - m)
    return d.toISOString().split('T')[0]
  }

  errands.forEach((errand) => {
    const interval = errand.interval_value as number
    const intervalType = errand.interval_type as string
    if (intervalType === 'miles') return

    const completions = Math.min(3, Math.floor(12 / interval))
    for (let i = 1; i <= completions; i++) {
      const scheduled = monthsAgo(i * interval)
      const dayOffset = Math.floor(Math.random() * 5) - 2
      const completedDate = new Date(scheduled + 'T00:00:00')
      completedDate.setDate(completedDate.getDate() + dayOffset)
      const completed = completedDate.toISOString().split('T')[0]

      records.push({
        id: genId(),
        errand_id: errand.id,
        user_id: DEMO_USER_ID,
        completed_date: completed,
        scheduled_date: scheduled,
        cost: Math.round(((errand.estimated_cost as number) * (0.8 + Math.random() * 0.4)) * 100) / 100,
        notes: null,
        created_at: new Date().toISOString(),
      })
    }
  })
  return records
}

// ---- Storage helpers -----------------------------------------------------------

function loadDb(): Record<string, Record<string, unknown>[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  const data = seedData()
  data.completion_history = buildCompletionHistory(data.errands)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return data
}

function saveDb(store: Record<string, Record<string, unknown>[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function getTable(table: string): Record<string, unknown>[] {
  const store = loadDb()
  if (!store[table]) {
    store[table] = []
    saveDb(store)
  }
  return store[table]
}

function setTable(table: string, rows: Record<string, unknown>[]) {
  const store = loadDb()
  store[table] = rows
  saveDb(store)
}

// ---- Mock DB API ---------------------------------------------------------------

export interface MockFilter {
  field: string
  value: unknown
}

export interface MockOrder {
  field: string
  direction: 'asc' | 'desc'
}

function applyFilters(rows: Record<string, unknown>[], filters?: MockFilter[]): Record<string, unknown>[] {
  if (!filters?.length) return rows
  return rows.filter((row) => filters.every((f) => row[f.field] === f.value))
}

function applyOrder(rows: Record<string, unknown>[], order?: MockOrder): Record<string, unknown>[] {
  if (!order) return rows
  return [...rows].sort((a, b) => {
    const av = a[order.field] as string | number
    const bv = b[order.field] as string | number
    if (av < bv) return order.direction === 'asc' ? -1 : 1
    if (av > bv) return order.direction === 'asc' ? 1 : -1
    return 0
  })
}

export const mockDb = {
  getAll<T>(table: string, filters?: MockFilter[], order?: MockOrder): T[] {
    let rows = applyFilters(getTable(table), filters)
    rows = applyOrder(rows, order)
    return rows as T[]
  },

  getOne<T>(table: string, id: string): T | null {
    const rows = getTable(table)
    return (rows.find((r) => r.id === id) as T) ?? null
  },

  insert<T>(table: string, data: Record<string, unknown>): T {
    const rows = getTable(table)
    const now = new Date().toISOString()
    const record = { id: genId(), created_at: now, updated_at: now, ...data }
    setTable(table, [...rows, record])
    return record as T
  },

  update<T>(table: string, id: string, data: Record<string, unknown>): T | null {
    const rows = getTable(table)
    const now = new Date().toISOString()
    let updated: Record<string, unknown> | null = null
    const newRows = rows.map((row) => {
      if (row.id === id) {
        updated = { ...row, ...data, updated_at: now }
        return updated
      }
      return row
    })
    setTable(table, newRows)
    return updated as T | null
  },

  remove(table: string, id: string): void {
    const rows = getTable(table)
    setTable(table, rows.filter((r) => r.id !== id))
  },

  removeWhere(table: string, filters: MockFilter[]): void {
    const rows = getTable(table)
    setTable(table, rows.filter((row) => !filters.every((f) => row[f.field] === f.value)))
  },

  removeByIds(table: string, ids: string[]): void {
    const rows = getTable(table)
    const idSet = new Set(ids)
    setTable(table, rows.filter((r) => !idSet.has(r.id as string)))
  },
}

// ---- Mock Auth -----------------------------------------------------------------

const DEMO_USER = {
  id: DEMO_USER_ID,
  email: 'demo@example.com',
}

type AuthCallback = (user: typeof DEMO_USER | null) => void
let _authCallback: AuthCallback | null = null

export const mockAuth = {
  onAuthStateChanged(callback: AuthCallback): () => void {
    _authCallback = callback
    setTimeout(() => callback(DEMO_USER), 0)
    return () => { _authCallback = null }
  },

  async signIn(_email: string, _password: string) {
    if (_authCallback) _authCallback(DEMO_USER)
    return DEMO_USER
  },

  async signUp(email: string, _password: string, name: string) {
    const store = loadDb()
    if (store.profiles[0]) {
      store.profiles[0].name = name
      store.profiles[0].updated_at = new Date().toISOString()
    }
    saveDb(store)
    if (_authCallback) _authCallback({ ...DEMO_USER, email })
    return { ...DEMO_USER, email }
  },

  async signOut() {
    if (_authCallback) _authCallback(null)
  },
}
