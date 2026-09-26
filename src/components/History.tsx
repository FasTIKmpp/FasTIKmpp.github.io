import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTimeStore } from '../hooks/useTimeStore'
import { formatHM, formatShort, monthDayLabel, timeOfDay, todayKey } from '../utils/time'

export function History() {
  const store = useTimeStore()
  const [cursor, setCursor] = useState(() => new Date())
  const [selected, setSelected] = useState<string | null>(null)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const monthLabel = cursor.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })

  const cells = useMemo(() => {
    const first = new Date(year, month, 1)
    const startOffset = (first.getDay() + 6) % 7 // Monday-first grid
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const arr: (string | null)[] = Array(startOffset).fill(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      arr.push(key)
    }
    return arr
  }, [year, month])

  const daySummary = (key: string) => {
    const tx = store.transactionsForDay(key)
    const spent = tx.reduce((s, t) => s + t.durationSeconds, 0)
    return { tx, spent }
  }

  const today = todayKey()
  const selectedData = selected ? daySummary(selected) : null

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-8 md:pt-12">
      <p className="text-sm text-ink-dim">История</p>
      <h1 className="mb-6 font-display text-2xl font-medium text-ink">Каждый день по отдельности</h1>

      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="text-ink-dim hover:text-ink">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium capitalize text-ink">{monthLabel}</span>
        <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="text-ink-dim hover:text-ink">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-ink-dim">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mb-8 grid grid-cols-7 gap-1.5">
        {cells.map((key, i) => {
          if (!key) return <div key={`empty-${i}`} />
          const { spent } = daySummary(key)
          const isToday = key === today
          const isSelected = key === selected
          const intensity = Math.min(1, spent / store.budgetSeconds)
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg border text-xs transition ${
                isSelected ? 'border-gold' : isToday ? 'border-ink-dim' : 'border-transparent'
              }`}
              style={{ backgroundColor: spent > 0 ? `rgba(201,160,92,${0.12 + intensity * 0.35})` : 'transparent' }}
            >
              <span className={isToday ? 'font-semibold text-gold' : 'text-ink'}>{Number(key.slice(-2))}</span>
            </button>
          )
        })}
      </div>

      {selectedData && selected && (
        <div className="animate-slide-up rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-display text-lg text-ink">{monthDayLabel(selected)}</h2>
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-ink-dim">Получено</p>
              <p className="font-mono text-sm text-ink">{formatHM(store.budgetSeconds)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-dim">Потрачено</p>
              <p className="font-mono text-sm text-ink">{formatHM(selectedData.spent)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-dim">Не использовано</p>
              <p className="font-mono text-sm text-ink">{formatHM(Math.max(0, store.budgetSeconds - selectedData.spent))}</p>
            </div>
          </div>
          {selectedData.tx.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-dim">Операций в этот день не было.</p>
          ) : (
            <div className="space-y-2">
              {selectedData.tx.map((t) => {
                const cat = store.categories.find((c) => c.id === t.categoryId)
                return (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat?.color ?? '#888' }} />
                      <span className="text-ink">{t.name}</span>
                      <span className="text-xs text-ink-dim">
                        {timeOfDay(t.startTime)}–{timeOfDay(t.endTime)}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums text-ink-dim">{formatShort(t.durationSeconds, true)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
