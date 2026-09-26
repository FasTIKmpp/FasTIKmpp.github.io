import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useTimeStore } from '../hooks/useTimeStore'

interface Toast {
  id: string
  text: string
}

export function Notifications() {
  const store = useTimeStore()
  const [toasts, setToasts] = useState<Toast[]>([])
  const fired = useRef<Set<string>>(new Set())

  useEffect(() => {
    const activityMinutes = store.activeTimer ? store.elapsedTimerSeconds / 60 : 0
    const remainingMinutes = store.remainingSecondsToday / 60

    for (const r of store.reminders) {
      if (!r.enabled) continue
      if (r.kind === 'during-activity' && store.activeTimer) {
        const key = `${r.id}:${store.activeTimer.startedAt}`
        if (activityMinutes >= r.minutes && !fired.current.has(key)) {
          fired.current.add(key)
          pushToast(`${store.activeTimer.name}: ${r.label}`)
        }
      }
      if (r.kind === 'budget-remaining') {
        const key = `${r.id}:${store.logicalDay}`
        if (remainingMinutes <= r.minutes && remainingMinutes > 0 && !fired.current.has(key)) {
          fired.current.add(key)
          pushToast(r.label)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.elapsedTimerSeconds, store.remainingSecondsToday, store.logicalDay])

  function pushToast(text: string) {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000)
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-24 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 md:bottom-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 rounded-xl border border-gold/40 bg-surface px-4 py-3 text-sm text-ink shadow-lg animate-slide-up"
        >
          <Bell size={15} className="shrink-0 text-gold" />
          {t.text}
        </div>
      ))}
    </div>
  )
}
