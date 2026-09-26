import { useState } from 'react'
import { Bell, Moon, Sun, Trash2 } from 'lucide-react'
import { useTimeStore } from '../hooks/useTimeStore'

export function Settings() {
  const store = useTimeStore()
  const [reminderLabel, setReminderLabel] = useState('')
  const [reminderMinutes, setReminderMinutes] = useState(10)
  const [reminderKind, setReminderKind] = useState<'before-start' | 'during-activity' | 'budget-remaining'>(
    'before-start'
  )

  const kindText: Record<string, string> = {
    'before-start': 'За N минут до начала',
    'during-activity': 'Через N минут активности',
    'budget-remaining': 'Когда осталось N минут бюджета',
  }

  const addReminder = () => {
    if (!reminderLabel.trim()) return
    store.addReminder({ label: reminderLabel.trim(), kind: reminderKind, minutes: reminderMinutes, enabled: true })
    setReminderLabel('')
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-8 md:pt-12">
      <p className="text-sm text-ink-dim">Настройки</p>
      <h1 className="mb-6 font-display text-2xl font-medium text-ink">Твои правила</h1>

      <div className="mb-6 rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-ink">Дневной бюджет</p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={4}
            max={20}
            step={0.5}
            value={store.settings.dailyBudgetHours}
            onChange={(e) => store.updateSettings({ dailyBudgetHours: Number(e.target.value) })}
            className="flex-1 accent-gold"
          />
          <span className="w-16 text-right font-mono text-sm tabular-nums text-ink">
            {store.settings.dailyBudgetHours} ч
          </span>
        </div>
        <p className="mt-2 text-xs text-ink-dim">Сколько часов внимания ты получаешь каждый день.</p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-ink">Начало дня</p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={12}
            value={store.settings.dayStartHour}
            onChange={(e) => store.updateSettings({ dayStartHour: Number(e.target.value) })}
            className="flex-1 accent-gold"
          />
          <span className="w-16 text-right font-mono text-sm tabular-nums text-ink">
            {String(store.settings.dayStartHour).padStart(2, '0')}:00
          </span>
        </div>
        <p className="mt-2 text-xs text-ink-dim">Время, когда баланс обнуляется и начинается новый день.</p>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-xl border border-border bg-surface p-4">
        <div>
          <p className="text-sm font-medium text-ink">Тема оформления</p>
          <p className="text-xs text-ink-dim">Тёмная по умолчанию</p>
        </div>
        <button
          onClick={() =>
            store.updateSettings({ theme: store.settings.theme === 'dark' ? 'light' : 'dark' })
          }
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink transition hover:border-gold"
        >
          {store.settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-xl border border-border bg-surface p-4">
        <div>
          <p className="text-sm font-medium text-ink">Автоматическое отслеживание</p>
          <p className="text-xs text-ink-dim">Списывать время только когда таймер запущен вручную</p>
        </div>
        <button
          onClick={() => store.updateSettings({ autoTrack: !store.settings.autoTrack })}
          className={`relative h-6 w-11 rounded-full transition ${store.settings.autoTrack ? 'bg-gold' : 'bg-surface-alt'}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              store.settings.autoTrack ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
          <Bell size={15} />
          Напоминания
        </p>

        {store.reminders.length > 0 && (
          <div className="mb-4 space-y-2">
            {store.reminders.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <div>
                  <p className="text-ink">{r.label}</p>
                  <p className="text-xs text-ink-dim">
                    {kindText[r.kind]} — {r.minutes} мин
                  </p>
                </div>
                <button onClick={() => store.deleteReminder(r.id)} className="text-ink-dim hover:text-category-leak">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          value={reminderLabel}
          onChange={(e) => setReminderLabel(e.target.value)}
          placeholder="Например, Начать Golang"
          className="mb-3 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-gold"
        />
        <div className="mb-3 flex flex-wrap gap-2">
          {(['before-start', 'during-activity', 'budget-remaining'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setReminderKind(k)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                reminderKind === k ? 'border-gold text-gold' : 'border-border text-ink-dim'
              }`}
            >
              {kindText[k]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={reminderMinutes}
            onChange={(e) => setReminderMinutes(Math.max(1, Number(e.target.value)))}
            className="w-20 rounded-lg border border-border bg-bg px-2 py-2 text-center font-mono text-sm text-ink outline-none focus:border-gold"
          />
          <span className="text-xs text-ink-dim">минут</span>
          <button
            onClick={addReminder}
            className="ml-auto rounded-lg bg-gold px-4 py-2 text-sm font-medium text-bg transition hover:brightness-110"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  )
}
