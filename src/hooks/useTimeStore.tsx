import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { ActiveTimer, Category, PlanItem, ReminderRule, Settings, Transaction } from '../types'
import { loadJSON, saveJSON, STORAGE_KEYS } from '../utils/storage'
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS, uid } from '../utils/defaults'
import { dayKeyForInstant, hoursToSeconds, todayKey } from '../utils/time'

interface State {
  categories: Category[]
  transactions: Transaction[]
  plans: PlanItem[]
  settings: Settings
  activeTimer: ActiveTimer | null
  reminders: ReminderRule[]
}

type Action =
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: { id: string; fallbackId: string } }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: { id: string } }
  | { type: 'ADD_PLAN'; payload: PlanItem }
  | { type: 'DELETE_PLAN'; payload: { id: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'START_TIMER'; payload: ActiveTimer }
  | { type: 'STOP_TIMER' }
  | { type: 'ADD_REMINDER'; payload: ReminderRule }
  | { type: 'DELETE_REMINDER'; payload: { id: string } }
  | { type: 'HYDRATE'; payload: Partial<State> }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.payload.id ? action.payload : c)),
      }
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload.id),
        transactions: state.transactions.map((t) =>
          t.categoryId === action.payload.id ? { ...t, categoryId: action.payload.fallbackId } : t
        ),
        plans: state.plans.map((p) =>
          p.categoryId === action.payload.id ? { ...p, categoryId: action.payload.fallbackId } : p
        ),
      }
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] }
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.payload.id ? action.payload : t)),
      }
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.payload.id) }
    case 'ADD_PLAN':
      return { ...state, plans: [...state.plans, action.payload] }
    case 'DELETE_PLAN':
      return { ...state, plans: state.plans.filter((p) => p.id !== action.payload.id) }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    case 'START_TIMER':
      return { ...state, activeTimer: action.payload }
    case 'STOP_TIMER':
      return { ...state, activeTimer: null }
    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.payload] }
    case 'DELETE_REMINDER':
      return { ...state, reminders: state.reminders.filter((r) => r.id !== action.payload.id) }
    case 'HYDRATE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

function initState(): State {
  return {
    categories: loadJSON(STORAGE_KEYS.categories, DEFAULT_CATEGORIES),
    transactions: loadJSON<Transaction[]>(STORAGE_KEYS.transactions, []),
    plans: loadJSON<PlanItem[]>(STORAGE_KEYS.plans, []),
    settings: loadJSON<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
    activeTimer: loadJSON<ActiveTimer | null>(STORAGE_KEYS.activeTimer, null),
    reminders: loadJSON<ReminderRule[]>(STORAGE_KEYS.reminders, []),
  }
}

interface DayEndInfo {
  date: string
  budgetSeconds: number
  spentSeconds: number
  unusedSeconds: number
}

interface StoreValue extends State {
  logicalDay: string
  budgetSeconds: number
  todayTransactions: Transaction[]
  spentSecondsToday: number
  remainingSecondsToday: number
  elapsedTimerSeconds: number
  dayEndInfo: DayEndInfo | null
  dismissDayEnd: () => void
  addCategory: (name: string, color: string) => void
  updateCategory: (cat: Category) => void
  deleteCategory: (id: string) => void
  addTransaction: (input: { name: string; categoryId: string; durationSeconds: number; startTime?: string; endTime?: string; date?: string }) => void
  updateTransaction: (t: Transaction) => void
  deleteTransaction: (id: string) => void
  addPlan: (input: { name: string; categoryId: string; plannedSeconds: number; date?: string }) => void
  deletePlan: (id: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  startTimer: (name: string, categoryId: string) => void
  stopTimer: () => void
  addReminder: (r: Omit<ReminderRule, 'id'>) => void
  deleteReminder: (id: string) => void
  transactionsForDay: (dateKey: string) => Transaction[]
  plansForDay: (dateKey: string) => PlanItem[]
}

const TimeStoreContext = createContext<StoreValue | null>(null)

export function TimeStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)
  const [, forceTick] = useState(0)
  const [dayEndInfo, setDayEndInfo] = useState<DayEndInfo | null>(null)
  const lastLogicalDay = useRef<string>(dayKeyForInstant(state.settings.dayStartHour))

  // persist on every change
  useEffect(() => saveJSON(STORAGE_KEYS.categories, state.categories), [state.categories])
  useEffect(() => saveJSON(STORAGE_KEYS.transactions, state.transactions), [state.transactions])
  useEffect(() => saveJSON(STORAGE_KEYS.plans, state.plans), [state.plans])
  useEffect(() => saveJSON(STORAGE_KEYS.settings, state.settings), [state.settings])
  useEffect(() => saveJSON(STORAGE_KEYS.activeTimer, state.activeTimer), [state.activeTimer])
  useEffect(() => saveJSON(STORAGE_KEYS.reminders, state.reminders), [state.reminders])

  // ticking clock — drives timer display and day-rollover detection
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const logicalDay = dayKeyForInstant(state.settings.dayStartHour)
  const budgetSeconds = hoursToSeconds(state.settings.dailyBudgetHours)

  // detect day rollover while the app stays open
  useEffect(() => {
    if (lastLogicalDay.current !== logicalDay) {
      const prevDay = lastLogicalDay.current
      const prevTx = state.transactions.filter((t) => t.date === prevDay)
      const spent = prevTx.reduce((s, t) => s + t.durationSeconds, 0)
      setDayEndInfo({
        date: prevDay,
        budgetSeconds,
        spentSeconds: spent,
        unusedSeconds: Math.max(0, budgetSeconds - spent),
      })
      lastLogicalDay.current = logicalDay
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logicalDay])

  const todayTransactions = useMemo(
    () => state.transactions.filter((t) => t.date === logicalDay).sort((a, b) => (a.startTime < b.startTime ? 1 : -1)),
    [state.transactions, logicalDay]
  )

  const spentFromLoggedToday = useMemo(
    () => todayTransactions.reduce((s, t) => s + t.durationSeconds, 0),
    [todayTransactions]
  )

  const elapsedTimerSeconds = state.activeTimer
    ? Math.max(0, (Date.now() - new Date(state.activeTimer.startedAt).getTime()) / 1000)
    : 0

  const spentSecondsToday = spentFromLoggedToday + elapsedTimerSeconds
  const remainingSecondsToday = Math.max(0, budgetSeconds - spentSecondsToday)

  const addCategory = useCallback((name: string, color: string) => {
    dispatch({ type: 'ADD_CATEGORY', payload: { id: uid('cat'), name, color, kind: 'custom' } })
  }, [])

  const updateCategory = useCallback((cat: Category) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: cat })
  }, [])

  const deleteCategory = useCallback(
    (id: string) => {
      const fallback = state.categories.find((c) => c.id !== id)?.id ?? DEFAULT_CATEGORIES[0].id
      dispatch({ type: 'DELETE_CATEGORY', payload: { id, fallbackId: fallback } })
    },
    [state.categories]
  )

  const addTransaction = useCallback<StoreValue['addTransaction']>((input) => {
    const now = new Date().toISOString()
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: uid('tx'),
        name: input.name,
        categoryId: input.categoryId,
        durationSeconds: input.durationSeconds,
        startTime: input.startTime ?? now,
        endTime: input.endTime ?? now,
        date: input.date ?? dayKeyForInstant(state.settings.dayStartHour),
      },
    })
  }, [state.settings.dayStartHour])

  const updateTransaction = useCallback((t: Transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: t })
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: { id } })
  }, [])

  const addPlan = useCallback<StoreValue['addPlan']>((input) => {
    dispatch({
      type: 'ADD_PLAN',
      payload: {
        id: uid('plan'),
        name: input.name,
        categoryId: input.categoryId,
        plannedSeconds: input.plannedSeconds,
        date: input.date ?? dayKeyForInstant(state.settings.dayStartHour),
      },
    })
  }, [state.settings.dayStartHour])

  const deletePlan = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PLAN', payload: { id } })
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: patch })
  }, [])

  const startTimer = useCallback((name: string, categoryId: string) => {
    dispatch({ type: 'START_TIMER', payload: { name, categoryId, startedAt: new Date().toISOString() } })
  }, [])

  const stopTimer = useCallback(() => {
    if (!state.activeTimer) return
    const start = state.activeTimer.startedAt
    const end = new Date().toISOString()
    const duration = Math.max(1, (new Date(end).getTime() - new Date(start).getTime()) / 1000)
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: uid('tx'),
        name: state.activeTimer.name,
        categoryId: state.activeTimer.categoryId,
        durationSeconds: duration,
        startTime: start,
        endTime: end,
        date: dayKeyForInstant(state.settings.dayStartHour, new Date(start)),
      },
    })
    dispatch({ type: 'STOP_TIMER' })
  }, [state.activeTimer, state.settings.dayStartHour])

  const addReminder = useCallback((r: Omit<ReminderRule, 'id'>) => {
    dispatch({ type: 'ADD_REMINDER', payload: { ...r, id: uid('rem') } })
  }, [])

  const deleteReminder = useCallback((id: string) => {
    dispatch({ type: 'DELETE_REMINDER', payload: { id } })
  }, [])

  const transactionsForDay = useCallback(
    (dateKey: string) => state.transactions.filter((t) => t.date === dateKey).sort((a, b) => (a.startTime < b.startTime ? -1 : 1)),
    [state.transactions]
  )

  const plansForDay = useCallback(
    (dateKey: string) => state.plans.filter((p) => p.date === dateKey),
    [state.plans]
  )

  const dismissDayEnd = useCallback(() => setDayEndInfo(null), [])

  const value: StoreValue = {
    ...state,
    logicalDay,
    budgetSeconds,
    todayTransactions,
    spentSecondsToday,
    remainingSecondsToday,
    elapsedTimerSeconds,
    dayEndInfo,
    dismissDayEnd,
    addCategory,
    updateCategory,
    deleteCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addPlan,
    deletePlan,
    updateSettings,
    startTimer,
    stopTimer,
    addReminder,
    deleteReminder,
    transactionsForDay,
    plansForDay,
  }

  return <TimeStoreContext.Provider value={value}>{children}</TimeStoreContext.Provider>
}

export function useTimeStore(): StoreValue {
  const ctx = useContext(TimeStoreContext)
  if (!ctx) throw new Error('useTimeStore must be used within TimeStoreProvider')
  return ctx
}

export function todayKeyNow() {
  return todayKey()
}
