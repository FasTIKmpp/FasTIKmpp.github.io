import { useMemo, useState } from 'react'
import { Play, Square, Plus } from 'lucide-react'
import { useTimeStore } from '../hooks/useTimeStore'
import { BalanceRing } from './BalanceRing'
import { formatHM, formatHMS, monthDayLabel } from '../utils/time'
import { AddExpenseModal } from './AddExpenseModal'

export function Dashboard() {
  const store = useTimeStore()
  const { budgetSeconds, spentSecondsToday, remainingSecondsToday, activeTimer, categories, logicalDay } = store
  const [showAdd, setShowAdd] = useState(false)
  const [nextHourChoice, setNextHourChoice] = useState<string | null>(null)

  const usedFraction = budgetSeconds > 0 ? spentSecondsToday / budgetSeconds : 0
  const remainingFraction = 1 - usedFraction
  const percentUsed = Math.min(100, Math.round(usedFraction * 100))

  const ringColor = remainingFraction > 0.4 ? '#C9A05C' : remainingFraction > 0.15 ? '#D9A63E' : '#E2555B'

  const suggestions = useMemo(() => categories.slice(0, 5), [categories])

  const handleQuickStart = (name: string, categoryId: string) => {
    if (activeTimer) return
    store.startTimer(name, categoryId)
    setNextHourChoice(null)
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-8 md:pt-12">
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <p className="text-sm text-ink-dim dark:text-ink-dim">{monthDayLabel(logicalDay)}</p>
          <h1 className="font-display text-2xl font-medium text-ink dark:text-ink">Сегодня</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-ink-dim transition hover:border-gold hover:text-gold dark:border-border dark:text-ink-dim"
        >
          <Plus size={16} />
          Добавить
        </button>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          <BalanceRing fraction={remainingFraction} color={ringColor} />
          <div className="absolute flex flex-col items-center">
            <span className="font-mono text-4xl font-medium tabular-nums text-ink dark:text-ink sm:text-5xl">
              {formatHMS(remainingSecondsToday)}
            </span>
            <span className="mt-2 text-sm text-ink-dim">твой баланс внимания</span>
          </div>
        </div>

        {activeTimer && (
          <div className="mt-8 flex w-full max-w-sm items-center justify-between rounded-2xl border border-gold/40 bg-gold/10 px-5 py-4 animate-slide-up">
            <div>
              <p className="text-xs uppercase tracking-wide text-gold">Идёт сейчас</p>
              <p className="font-display text-lg text-ink">{activeTimer.name}</p>
            </div>
            <button
              onClick={() => store.stopTimer()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-bg transition hover:brightness-110"
              aria-label="Остановить таймер"
            >
              <Square size={18} fill="currentColor" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCell label="Получено" value={formatHM(budgetSeconds)} />
        <StatCell label="Потрачено" value={formatHM(spentSecondsToday)} />
        <StatCell label="Осталось" value={formatHM(remainingSecondsToday)} />
        <StatCell label="Использовано" value={`${percentUsed}%`} />
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-alt">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentUsed}%`, backgroundColor: ringColor }}
        />
      </div>

      {!activeTimer && (
        <div className="mt-10">
          <p className="mb-3 text-sm font-medium text-ink-dim">Куда уйдёт следующий час?</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((c) => (
              <button
                key={c.id}
                onClick={() => setNextHourChoice(nextHourChoice === c.id ? null : c.id)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  nextHourChoice === c.id
                    ? 'border-transparent text-bg'
                    : 'border-border text-ink-dim hover:border-ink-dim'
                }`}
                style={nextHourChoice === c.id ? { backgroundColor: c.color } : undefined}
              >
                {c.name}
              </button>
            ))}
          </div>
          {nextHourChoice && (
            <QuickStartForm
              categoryId={nextHourChoice}
              onStart={(name) => handleQuickStart(name, nextHourChoice)}
              onCancel={() => setNextHourChoice(null)}
            />
          )}
        </div>
      )}

      {showAdd && <AddExpenseModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <p className="text-xs text-ink-dim">{label}</p>
      <p className="mt-1 font-mono text-lg font-medium tabular-nums text-ink">{value}</p>
    </div>
  )
}

function QuickStartForm({
  categoryId,
  onStart,
  onCancel,
}: {
  categoryId: string
  onStart: (name: string) => void
  onCancel: () => void
}) {
  const { categories } = useTimeStore()
  const cat = categories.find((c) => c.id === categoryId)
  const [name, setName] = useState(cat?.name ?? '')

  return (
    <div className="mt-4 flex items-center gap-2 animate-slide-up">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Название активности"
        className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold"
      />
      <button
        onClick={() => name.trim() && onStart(name.trim())}
        className="flex items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-sm font-medium text-bg transition hover:brightness-110"
      >
        <Play size={14} fill="currentColor" />
        Начать
      </button>
      <button onClick={onCancel} className="px-2 text-sm text-ink-dim hover:text-ink">
        Отмена
      </button>
    </div>
  )
}
