import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useTimeStore } from '../hooks/useTimeStore'
import { formatHM } from '../utils/time'

export function Planning() {
  const store = useTimeStore()
  const plans = store.plansForDay(store.logicalDay)
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState(store.categories[0]?.id ?? '')
  const [hours, setHours] = useState(1)
  const [minutes, setMinutes] = useState(0)

  const allocated = plans.reduce((s, p) => s + p.plannedSeconds, 0)
  const remaining = Math.max(0, store.budgetSeconds - allocated)

  const handleAdd = () => {
    const plannedSeconds = hours * 3600 + minutes * 60
    if (!name.trim() || plannedSeconds <= 0) return
    store.addPlan({ name: name.trim(), categoryId, plannedSeconds, date: store.logicalDay })
    setName('')
    setHours(0)
    setMinutes(30)
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-8 md:pt-12">
      <p className="text-sm text-ink-dim">План на сегодня</p>
      <h1 className="mb-6 font-display text-2xl font-medium text-ink">Распредели свой бюджет</h1>

      <div className="mb-6 rounded-xl border border-border bg-surface px-4 py-3.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-dim">Распределено</span>
          <span className="font-mono tabular-nums text-ink">
            {formatHM(allocated)} / {formatHM(store.budgetSeconds)}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-alt">
          <div
            className="h-full rounded-full bg-gold transition-all duration-500"
            style={{ width: `${Math.min(100, (allocated / store.budgetSeconds) * 100)}%` }}
          />
        </div>
        {remaining > 0 && (
          <p className="mt-2 text-xs text-ink-dim">Свободный резерв: {formatHM(remaining)}</p>
        )}
      </div>

      <div className="mb-6 space-y-2.5">
        {plans.length === 0 && (
          <p className="rounded-xl border border-dashed border-border py-10 text-center text-ink-dim">
            План на сегодня пока пуст.
          </p>
        )}
        {plans.map((p) => {
          const cat = store.categories.find((c) => c.id === p.categoryId)
          return (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat?.color ?? '#888' }} />
                <span className="text-ink">{p.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm tabular-nums text-ink-dim">{formatHM(p.plannedSeconds)}</span>
                <button
                  onClick={() => store.deletePlan(p.id)}
                  className="text-ink-dim hover:text-category-leak"
                  aria-label="Удалить пункт плана"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-ink">Добавить пункт плана</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например, Спорт"
          className="mb-3 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-gold"
        />
        <div className="mb-3 flex flex-wrap gap-2">
          {store.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition"
              style={{
                borderColor: categoryId === c.id ? c.color : 'transparent',
                backgroundColor: categoryId === c.id ? `${c.color}22` : 'transparent',
                color: categoryId === c.id ? c.color : undefined,
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={hours}
              onChange={(e) => setHours(Math.max(0, Number(e.target.value)))}
              className="w-14 rounded-lg border border-border bg-bg px-2 py-2 text-center font-mono text-sm text-ink outline-none focus:border-gold"
            />
            <span className="text-xs text-ink-dim">ч</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
              className="w-14 rounded-lg border border-border bg-bg px-2 py-2 text-center font-mono text-sm text-ink outline-none focus:border-gold"
            />
            <span className="text-xs text-ink-dim">мин</span>
          </div>
          <button
            onClick={handleAdd}
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-sm font-medium text-bg transition hover:brightness-110"
          >
            <Plus size={14} />
            Добавить
          </button>
        </div>
      </div>
    </div>
  )
}
