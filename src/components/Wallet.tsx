import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { useTimeStore } from '../hooks/useTimeStore'
import { formatShort, timeOfDay } from '../utils/time'
import { AddExpenseModal } from './AddExpenseModal'
import type { Transaction } from '../types'

export function Wallet() {
  const store = useTimeStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-8 md:pt-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-dim">Кошелёк времени</p>
          <h1 className="font-display text-2xl font-medium text-ink">Операции сегодня</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-bg transition hover:brightness-110"
          aria-label="Добавить операцию"
        >
          <Plus size={18} />
        </button>
      </div>

      {store.todayTransactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-ink-dim">Сегодня ещё нет операций.</p>
          <p className="mt-1 text-sm text-ink-dim">Запусти таймер или добавь расход вручную.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {store.todayTransactions.map((t) => {
            const cat = store.categories.find((c) => c.id === t.categoryId)
            return (
              <li
                key={t.id}
                className="group flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5 transition hover:border-ink-dim/40"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="mt-0.5 h-9 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: cat?.color ?? '#888' }}
                  />
                  <div>
                    <p className="font-medium text-ink">{t.name}</p>
                    <p className="text-xs text-ink-dim">
                      {cat?.name ?? 'Без категории'} · {timeOfDay(t.startTime)}–{timeOfDay(t.endTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium tabular-nums text-ink">
                    {formatShort(t.durationSeconds, true)}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => setEditing(t)}
                      className="rounded-md p-1.5 text-ink-dim hover:bg-surface-alt hover:text-ink"
                      aria-label="Изменить"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(t.id)}
                      className="rounded-md p-1.5 text-ink-dim hover:bg-category-leak/10 hover:text-category-leak"
                      aria-label="Удалить"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {showAdd && <AddExpenseModal onClose={() => setShowAdd(false)} />}
      {editing && <AddExpenseModal editing={editing} onClose={() => setEditing(null)} />}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-xs rounded-2xl border border-border bg-surface p-5 text-center animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4 text-sm text-ink">Удалить эту операцию?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-lg border border-border py-2 text-sm text-ink-dim hover:text-ink"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  store.deleteTransaction(confirmDelete)
                  setConfirmDelete(null)
                }}
                className="flex-1 rounded-lg bg-category-leak py-2 text-sm font-medium text-white"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
