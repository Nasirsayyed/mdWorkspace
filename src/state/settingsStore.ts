import { create } from 'zustand'
import type { WorkspaceSettings } from '@/types'
import { DEFAULT_SETTINGS, getSettings, updateSettings, resetSettings } from '@/storage/settings'

interface SettingsState {
  settings: WorkspaceSettings
  loaded: boolean
  load: () => Promise<void>
  set: (changes: Partial<WorkspaceSettings>) => Promise<void>
  reset: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  load: async () => {
    const settings = await getSettings()
    set({ settings, loaded: true })
    applyTheme(settings)
  },
  set: async (changes) => {
    const next = await updateSettings(changes)
    set({ settings: next })
    applyTheme(next)
  },
  reset: async () => {
    const next = await resetSettings()
    set({ settings: next })
    applyTheme(next)
  },
}))

let mediaListenerAttached = false

export function applyTheme(settings: WorkspaceSettings): void {
  const root = document.documentElement
  const resolved = settings.theme === 'system' ? getSystemTheme() : settings.theme
  root.setAttribute('data-theme', resolved)
  root.setAttribute('data-accent', settings.accentColor)
  root.setAttribute('data-density', settings.density)
  root.style.colorScheme = resolved

  if (!mediaListenerAttached) {
    mediaListenerAttached = true
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    mql.addEventListener('change', () => {
      const current = useSettingsStore.getState().settings
      if (current.theme === 'system') {
        root.setAttribute('data-theme', getSystemTheme())
        root.style.colorScheme = getSystemTheme()
      }
    })
  }
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
