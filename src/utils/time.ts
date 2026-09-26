export function todayKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatHM(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h === 0) return `${m} мин`
  if (m === 0) return `${h} ч`
  return `${h} ч ${m} мин`
}

export function formatHMS(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map((v) => String(v).padStart(2, '0')).join(':')
}

export function formatShort(totalSeconds: number, signed = false): string {
  const sign = signed ? (totalSeconds < 0 ? '-' : '+') : ''
  const s = Math.abs(Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function hoursToSeconds(h: number): number {
  return Math.round(h * 3600)
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

export function timeOfDay(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function secondsUntilDayEnd(dayStartHour: number, now = new Date()): number {
  const next = new Date(now)
  next.setHours(dayStartHour, 0, 0, 0)
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1)
  }
  return Math.max(0, (next.getTime() - now.getTime()) / 1000)
}

export function dayKeyForInstant(dayStartHour: number, instant = new Date()): string {
  // A "logical day" runs from dayStartHour to dayStartHour next calendar day.
  const d = new Date(instant)
  if (d.getHours() < dayStartHour) {
    d.setDate(d.getDate() - 1)
  }
  return todayKey(d)
}

export function weekdayLabel(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', { weekday: 'short' })
}

export function monthDayLabel(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export function addDaysKey(dateKey: string, days: number): string {
  const d = new Date(dateKey + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return todayKey(d)
}

export function lastNDays(n: number, fromKey = todayKey()): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) out.push(addDaysKey(fromKey, -i))
  return out
}
