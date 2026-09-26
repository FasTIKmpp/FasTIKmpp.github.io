import { useEffect, useState } from 'react'
import { TimeStoreProvider, useTimeStore } from './hooks/useTimeStore'
import { Nav, type Tab } from './components/Nav'
import { Dashboard } from './components/Dashboard'
import { Wallet } from './components/Wallet'
import { Planning } from './components/Planning'
import { Categories } from './components/Categories'
import { Stats } from './components/Stats'
import { History } from './components/History'
import { Settings } from './components/Settings'
import { DayEndModal } from './components/DayEndModal'
import { Notifications } from './components/Notifications'

function Shell() {
  const store = useTimeStore()
  const [tab, setTab] = useState<Tab>('dashboard')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', store.settings.theme === 'dark')
  }, [store.settings.theme])

  return (
    <div className="min-h-screen bg-bg text-ink transition-colors dark:bg-bg dark:text-ink">
      <Nav active={tab} onChange={setTab} />
      <main className="md:pl-56">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'wallet' && <Wallet />}
        {tab === 'planning' && <Planning />}
        {tab === 'categories' && <Categories />}
        {tab === 'stats' && <Stats />}
        {tab === 'history' && <History />}
        {tab === 'settings' && <Settings />}
      </main>
      <Notifications />
      <DayEndModal />
    </div>
  )
}

export default function App() {
  return (
    <TimeStoreProvider>
      <Shell />
    </TimeStoreProvider>
  )
}
