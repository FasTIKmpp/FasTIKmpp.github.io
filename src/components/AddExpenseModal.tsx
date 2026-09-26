import { useState } from 'react'
import { X } from 'lucide-react'
import { useTimeStore } from '../hooks/useTimeStore'
import type { Transaction } from '../types'

interface Props {
  onClose: () => void
  editing?: Transaction
}

export function AddExpenseModal({ onClose, editing }: Props) {
  const store = useTimeStore()
  const [name, setName] = useState(editing?.name ?? '')
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? store.categories[0]?.id ?? '')
  const [hours, setHours] = useState(editing ? Math.floor(editing.durationSeconds / 3600) : 0)
  const [minutes, setMinutes] = useState(editing ? Math.round((editing.durationSeconds % 3600) / 60) : 30)

  const canSave = name.trim().length > 0 && categoryId && hours * 3600 + minutes * 60 > 0

  const handleSave = () => {
    const durationSeconds = hours * 3600 + minutes * 60
    if (editing) {
      const end = new Date(new Date(editing.startTime).getTime() + durationSeconds * 1000).toISOString()
      store.updateTransaction({ ...editing, name: name.trim(), categoryId, durationSeconds, endTime: end })
    } else {
      store.addTransaction({ name: name.trim(), categoryId, durationSeconds })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-2xl border border-border bg-surface p-6 sm:rounded-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink">
            {editing ? 'Изменить расход' : 'Добавить расход времени'}
          </h2>
          <button onClick={onClose} className="text-ink-dim hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <label className="mb-1 block text-xs text-ink-dim">Название</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например, Golang"
          className="mb-4 w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink outline-none focus:border-gold"
        />

        <label className="mb-1 block text-xs text-ink-dim">Категория</label>
        <div className="mb-4 flex flex-wrap gap-2">
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

        <label className="mb-1 block text-xs text-ink-dim">Продолжительность</label>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={23}
              value={hours}
              onChange={(e) => setHours(Math.max(0, Number(e.target.value)))}
              className="w-16 rounded-lg border border-border bg-bg px-2 py-2 text-center font-mono text-sm text-ink outline-none focus:border-gold"
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
              className="w-16 rounded-lg border border-border bg-bg px-2 py-2 text-center font-mono text-sm text-ink outline-none focus:border-gold"
            />
            <span className="text-xs text-ink-dim">мин</span>
          </div>
        </div>

        <button
          disabled={!canSave}
          onClick={handleSave}
          className="w-full rounded-lg bg-gold py-3 text-sm font-medium text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {editing ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </div>
  )
}
