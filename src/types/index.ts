export type CategoryKind = 'investment' | 'required' | 'recovery' | 'leak' | 'custom'

export interface Category {
  id: string
  name: string
  kind: CategoryKind
  color: string // hex
  isDefault?: boolean
}

export interface Transaction {
  id: string
  name: string
  categoryId: string
  date: string // YYYY-MM-DD, local day this expense belongs to
  startTime: string // ISO timestamp
  endTime: string // ISO timestamp
  durationSeconds: number
  note?: string
}

export interface PlanItem {
  id: string
  date: string // YYYY-MM-DD
  name: string
  categoryId: string
  plannedSeconds: number
}

export interface ActiveTimer {
  name: string
  categoryId: string
  startedAt: string // ISO timestamp
}

export interface Settings {
  dailyBudgetHours: number
  theme: 'dark' | 'light'
  autoTrack: boolean
  dayStartHour: number // hour of day the budget resets, 0-23
}

export interface DaySnapshot {
  date: string
  budgetSeconds: number
  spentSeconds: number
  unusedSeconds: number
  transactions: Transaction[]
}

export interface ReminderRule {
  id: string
  label: string
  kind: 'before-start' | 'during-activity' | 'budget-remaining'
  minutes: number
  enabled: boolean
}
