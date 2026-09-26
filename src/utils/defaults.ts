import type { Category, Settings } from '../types'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-investment', name: 'Инвестиции', kind: 'investment', color: '#4FB286', isDefault: true },
  { id: 'cat-required', name: 'Обязательное', kind: 'required', color: '#5B8DEF', isDefault: true },
  { id: 'cat-recovery', name: 'Восстановление', kind: 'recovery', color: '#D9A63E', isDefault: true },
  { id: 'cat-leak', name: 'Утечки', kind: 'leak', color: '#E2555B', isDefault: true },
]

export const DEFAULT_SETTINGS: Settings = {
  dailyBudgetHours: 16,
  theme: 'dark',
  autoTrack: false,
  dayStartHour: 7,
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
