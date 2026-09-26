import { LayoutDashboard, WalletMinimal, CalendarClock, PieChart, CalendarDays, Settings2, Tags } from 'lucide-react'

export type Tab = 'dashboard' | 'wallet' | 'planning' | 'categories' | 'stats' | 'history' | 'settings'

const items: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Сегодня', icon: LayoutDashboard },
  { id: 'wallet', label: 'Кошелёк', icon: WalletMinimal },
  { id: 'planning', label: 'План', icon: CalendarClock },
  { id: 'categories', label: 'Категории', icon: Tags },
  { id: 'stats', label: 'Аналитика', icon: PieChart },
  { id: 'history', label: 'История', icon: CalendarDays },
  { id: 'settings', label: 'Настройки', icon: Settings2 },
]

export function Nav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="fixed left-0 top-0 hidden h-full w-56 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
        <div className="mb-8 px-2">
          <p className="font-display text-lg font-medium text-ink">Время</p>
          <p className="text-xs text-ink-dim">валюта внимания</p>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive ? 'bg-gold/10 text-gold' : 'text-ink-dim hover:bg-surface-alt hover:text-ink'
                }`}
              >
                <Icon size={17} />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-border bg-surface/95 px-1 py-2 backdrop-blur md:hidden">
        {items
          .filter((i) => i.id !== 'settings' && i.id !== 'categories')
          .map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] transition ${
                  isActive ? 'text-gold' : 'text-ink-dim'
                }`}
              >
                <Icon size={19} />
                {item.label}
              </button>
            )
          })}
        <button
          onClick={() => onChange('settings')}
          className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] transition ${
            active === 'settings' || active === 'categories' ? 'text-gold' : 'text-ink-dim'
          }`}
        >
          <Settings2 size={19} />
          Ещё
        </button>
      </nav>
    </>
  )
}
