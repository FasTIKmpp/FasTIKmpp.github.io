import { useTimeStore } from '../hooks/useTimeStore'
import { formatHM } from '../utils/time'
import { monthDayLabel } from '../utils/time'

export function DayEndModal() {
  const store = useTimeStore()
  const info = store.dayEndInfo
  if (!info) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-bg/95 backdrop-blur-md">
      <div className="mx-6 max-w-sm text-center animate-slide-up">
        <p className="mb-1 text-xs uppercase tracking-widest text-gold">День завершён</p>
        <h2 className="mb-6 font-display text-2xl text-ink">{monthDayLabel(info.date)}</h2>

        <div className="mb-8 space-y-3">
          <p className="text-ink-dim">
            Сегодня тебе было доступно <span className="font-mono text-ink">{formatHM(info.budgetSeconds)}</span>
          </p>
          <p className="text-ink-dim">
            Ты потратил <span className="font-mono text-ink">{formatHM(info.spentSeconds)}</span>
          </p>
          <p className="text-ink-dim">
            <span className="font-mono text-ink">{formatHM(info.unusedSeconds)}</span> не было использовано
          </p>
        </div>

        <p className="mb-6 text-sm text-ink-dim">Завтра ты получишь новый бюджет.</p>

        <button
          onClick={store.dismissDayEnd}
          className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-bg transition hover:brightness-110"
        >
          Начать новый день
        </button>
      </div>
    </div>
  )
}
