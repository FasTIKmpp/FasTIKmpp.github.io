import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useTimeStore } from '../hooks/useTimeStore'
import { formatHM, lastNDays, weekdayLabel } from '../utils/time'
import type { Transaction } from '../types'

type Period = 'today' | 'week' | 'month'

export function Stats() {
  const store = useTimeStore()
  const [period, setPeriod] = useState<Period>('week')

  const days = useMemo(() => {
    const n = period === 'today' ? 1 : period === 'week' ? 7 : 30
    return lastNDays(n, store.logicalDay)
  }, [period, store.logicalDay])

  const txInRange = useMemo(
    () => store.transactions.filter((t) => days.includes(t.date)),
    [store.transactions, days]
  )

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of txInRange) map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.durationSeconds)
    return store.categories
      .map((c) => ({ id: c.id, name: c.name, color: c.color, seconds: map.get(c.id) ?? 0 }))
      .filter((c) => c.seconds > 0)
  }, [txInRange, store.categories])

  const dailySeries = useMemo(() => {
    return days.map((d) => {
      const dayTx = txInRange.filter((t) => t.date === d)
      const row: Record<string, number | string> = { day: weekdayLabel(d) }
      for (const c of store.categories) {
        row[c.id] = dayTx.filter((t) => t.categoryId === c.id).reduce((s, t) => s + t.durationSeconds, 0) / 60
      }
      return row
    })
  }, [days, txInRange, store.categories])

  const kindTotal = (kind: string) =>
    txInRange
      .filter((t) => store.categories.find((c) => c.id === t.categoryId)?.kind === kind)
      .reduce((s, t) => s + t.durationSeconds, 0)

  const investmentAvg = kindTotal('investment') / days.length
  const recoveryAvg = kindTotal('recovery') / days.length

  const topLeaks = useMemo(() => {
    const leakCatIds = store.categories.filter((c) => c.kind === 'leak').map((c) => c.id)
    const grouped = new Map<string, number>()
    txInRange
      .filter((t) => leakCatIds.includes(t.categoryId))
      .forEach((t) => grouped.set(t.name, (grouped.get(t.name) ?? 0) + t.durationSeconds))
    return [...grouped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [txInRange, store.categories])

  const plannedVsActual = useMemo(() => {
    const relevantPlans = store.plans.filter((p) => days.includes(p.date))
    const planned = relevantPlans.reduce((s, p) => s + p.plannedSeconds, 0)
    const actual = txInRange.reduce((s: number, t: Transaction) => s + t.durationSeconds, 0)
    return { planned, actual }
  }, [store.plans, days, txInRange])

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-8 md:pt-12">
      <p className="text-sm text-ink-dim">Аналитика</p>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-ink">Структура твоего времени</h1>
        <div className="flex rounded-full border border-border p-1">
          {(['today', 'week', 'month'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                period === p ? 'bg-gold text-bg' : 'text-ink-dim hover:text-ink'
              }`}
            >
              {p === 'today' ? 'Сегодня' : p === 'week' ? '7 дней' : '30 дней'}
            </button>
          ))}
        </div>
      </div>

      {txInRange.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-ink-dim">
          Пока недостаточно данных за этот период.
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-xl border border-border bg-surface p-4">
            <p className="mb-2 text-sm font-medium text-ink">Распределение по категориям</p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="h-52 w-52 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={byCategory} dataKey="seconds" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {byCategory.map((c) => (
                        <Cell key={c.id} fill={c.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => formatHM(v)}
                      contentStyle={{ background: '#1D2029', border: '1px solid #2A2D38', borderRadius: 8, color: '#F2F1ED' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-2">
                {byCategory.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink-dim">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-mono tabular-nums text-ink">{formatHM(c.seconds)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-border bg-surface p-4">
            <p className="mb-3 text-sm font-medium text-ink">По дням</p>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <BarChart data={dailySeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2D38" vertical={false} />
                  <XAxis dataKey="day" stroke="#9497A6" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9497A6" fontSize={12} tickLine={false} axisLine={false} width={36} />
                  <Tooltip
                    formatter={(v: number) => `${Math.round(v)} мин`}
                    contentStyle={{ background: '#1D2029', border: '1px solid #2A2D38', borderRadius: 8, color: '#F2F1ED' }}
                  />
                  {store.categories.map((c) => (
                    <Bar key={c.id} dataKey={c.id} stackId="a" fill={c.color} radius={[0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs text-ink-dim">Среднее на инвестиции / день</p>
              <p className="mt-1 font-mono text-lg text-category-investment">{formatHM(investmentAvg)}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs text-ink-dim">Среднее на отдых / день</p>
              <p className="mt-1 font-mono text-lg text-category-recovery">{formatHM(recoveryAvg)}</p>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-border bg-surface p-4">
            <p className="mb-3 text-sm font-medium text-ink">Запланировано vs потрачено</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-dim">План</span>
              <span className="font-mono tabular-nums text-ink">{formatHM(plannedVsActual.planned)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-ink-dim">Факт</span>
              <span className="font-mono tabular-nums text-ink">{formatHM(plannedVsActual.actual)}</span>
            </div>
          </div>

          {topLeaks.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="mb-3 text-sm font-medium text-ink">Самые частые утечки</p>
              <div className="space-y-2">
                {topLeaks.map(([name, seconds]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="text-ink-dim">{name}</span>
                    <span className="font-mono tabular-nums text-category-leak">{formatHM(seconds)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
