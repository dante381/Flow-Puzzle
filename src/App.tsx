import { useEffect } from 'react'
import { useUIStore } from './store/uiStore'
import { useSettingsStore } from './store/settingsStore'
import { MenuPage } from './pages/MenuPage'
import { GamePage } from './pages/GamePage'
import { SettingsPage } from './pages/SettingsPage'
import { HowToPlayPage } from './pages/HowToPlayPage'

export function App() {
  const page = useUIStore(s => s.currentPage)
  const theme = useSettingsStore(s => s.theme)

  useEffect(() => {
    const applyTheme = (t: typeof theme) => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const isDark = t === 'dark' || (t === 'system' && prefersDark)
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    }

    applyTheme(theme)

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  return (
    <div
      className="min-h-screen select-none"
      style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
    >
      {page === 'menu'      && <MenuPage />}
      {page === 'game'      && <GamePage />}
      {page === 'settings'  && <SettingsPage />}
      {page === 'howtoplay' && <HowToPlayPage />}
    </div>
  )
}
