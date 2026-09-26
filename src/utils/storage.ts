// Thin persistence layer. Everything goes through this module so that a future
// backend/account sync can replace the implementation without touching the
// rest of the app (same get/set/subscribe surface, just backed by an API).

const PREFIX = 'time-currency:v1:'

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // storage full or unavailable — fail silently, in-memory state still works
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // ignore
  }
}

export const STORAGE_KEYS = {
  categories: 'categories',
  transactions: 'transactions',
  plans: 'plans',
  settings: 'settings',
  activeTimer: 'activeTimer',
  reminders: 'reminders',
  lastSeenDay: 'lastSeenDay',
} as const
