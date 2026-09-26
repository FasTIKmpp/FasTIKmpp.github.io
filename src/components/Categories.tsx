import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useTimeStore } from '../hooks/useTimeStore'

const PALETTE = ['#4FB286', '#5B8DEF', '#D9A63E', '#E2555B', '#9B8CF2', '#4FC3D9', '#E88A4E', '#C9A05C']

export function Categories() {
  const store = useTimeStore()
  const [name, setName] = useState('')
  const [color, setColor] = useState(PALETTE[4])

  const handleCreate = () => {
    if (!name.trim()) return
    store.addCategory(name.trim(), color)
    setName('')
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-8 md:pt-12">
      <p className="text-sm text-ink-dim">Категории</p>
      <h1 className="mb-6 font-display text-2xl font-medium text-ink">Как устроен твой день</h1>

      <div className="mb-8 space-y-2.5">
        {store.categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5"
          >
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
              <div>
                <p className="text-ink">{c.name}</p>
                {c.isDefault && <p className="text-xs text-ink-dim">Предустановленная</p>}
              </div>
            </div>
            {!c.isDefault && (
              <button
                onClick={() => store.deleteCategory(c.id)}
                className="text-ink-dim hover:text-category-leak"
                aria-label="Удалить категорию"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-ink">Своя категория</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например, Музыка"
          className="mb-3 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-gold"
        />
        <div className="mb-4 flex flex-wrap gap-2">
          {PALETTE.map((p) => (
            <button
              key={p}
              onClick={() => setColor(p)}
              className="h-7 w-7 rounded-full transition"
              style={{
                backgroundColor: p,
                boxShadow: color === p ? `0 0 0 2px rgb(var(--color-surface)), 0 0 0 4px ${p}` : 'none',
              }}
              aria-label={`Выбрать цвет ${p}`}
            />
          ))}
        </div>
        <button
          onClick={handleCreate}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gold py-2.5 text-sm font-medium text-bg transition hover:brightness-110"
        >
          <Plus size={16} />
          Создать категорию
        </button>
      </div>
    </div>
  )
}
