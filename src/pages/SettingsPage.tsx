import { useSettingsStore } from '../store/settingsStore'
import { useProgressStore } from '../store/progressStore'
import { useUIStore } from '../store/uiStore'
import { Button } from '../components/shared/Button'
import { PALETTES, COLOR_NAMES } from '../constants/colors'
import { useState } from 'react'
import type { Theme, ColorblindMode } from '../types'

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${checked ? 'bg-accent' : 'bg-bg-secondary border border-border'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
      <span className="text-text-primary text-sm font-medium">{label}</span>
      {children}
    </div>
  )
}

export function SettingsPage() {
  const settings = useSettingsStore()
  const update = useSettingsStore(s => s.update)
  const resetProgress = useProgressStore(s => s.resetProgress)
  const navigate = useUIStore(s => s.navigate)
  const [confirmReset, setConfirmReset] = useState(false)

  const palette = PALETTES[settings.colorblindMode] ?? PALETTES.none

  function handleReset() {
    if (confirmReset) {
      resetProgress()
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
    }
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto px-4 py-8 gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('menu')}
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-bg-secondary"
          aria-label="Back to menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
      </div>

      {/* Appearance */}
      <div>
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">Appearance</h2>
        <div className="bg-bg-card rounded-2xl px-4">
          <Row label="Theme">
            <div className="flex gap-1.5">
              {(['dark', 'light', 'system'] as Theme[]).map(t => (
                <button
                  key={t}
                  onClick={() => update({ theme: t })}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${settings.theme === t ? 'bg-accent text-white' : 'bg-bg-secondary text-text-secondary hover:text-text-primary'}`}
                  aria-pressed={settings.theme === t}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </Row>

          <Row label="Color Vision">
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex gap-1.5">
                {(['none', 'deuteranopia', 'protanopia', 'tritanopia'] as ColorblindMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => update({ colorblindMode: mode })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${settings.colorblindMode === mode ? 'bg-accent text-white' : 'bg-bg-secondary text-text-secondary hover:text-text-primary'}`}
                    aria-pressed={settings.colorblindMode === mode}
                    aria-label={`Color mode: ${mode === 'none' ? 'Normal' : mode}`}
                  >
                    {mode === 'none' ? 'Normal' : mode.slice(0, 5)}
                  </button>
                ))}
              </div>
              {/* Color preview */}
              <div className="flex gap-1" aria-label="Color palette preview">
                {palette.slice(0, 6).map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-border/50"
                    style={{ background: color }}
                    aria-label={COLOR_NAMES[i]}
                  />
                ))}
              </div>
            </div>
          </Row>
        </div>
      </div>

      {/* Gameplay */}
      <div>
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">Gameplay</h2>
        <div className="bg-bg-card rounded-2xl px-4">
          <Row label="Show Timer">
            <Toggle
              checked={settings.showTimer}
              onChange={v => update({ showTimer: v })}
              label="Show timer toggle"
            />
          </Row>
          <Row label="Show Move Count">
            <Toggle
              checked={settings.showMoveCount}
              onChange={v => update({ showMoveCount: v })}
              label="Show move count toggle"
            />
          </Row>
        </div>
      </div>

      {/* Data */}
      <div>
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">Data</h2>
        <div className="bg-bg-card rounded-2xl px-4">
          <Row label="Reset All Progress">
            <Button
              variant={confirmReset ? 'danger' : 'ghost'}
              size="sm"
              onClick={handleReset}
              aria-label={confirmReset ? 'Confirm reset all progress' : 'Reset all progress'}
            >
              {confirmReset ? 'Confirm Reset' : 'Reset'}
            </Button>
          </Row>
        </div>
        {confirmReset && (
          <p className="text-xs text-danger mt-2 px-1">
            This will erase all completed levels and stars. Tap "Confirm Reset" to proceed.
          </p>
        )}
      </div>

      {/* Version info */}
      <p className="text-center text-xs text-text-secondary/40 mt-auto pt-4">
        Flow Puzzle · 10,000 levels · No ads · No accounts
      </p>
    </div>
  )
}
