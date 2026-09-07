import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/state/settingsStore'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useTabsStore } from '@/state/tabsStore'

export function useAppInit() {
  const [ready, setReady] = useState(false)
  const loadSettings = useSettingsStore((s) => s.load)
  const loadWorkspace = useWorkspaceStore((s) => s.load)
  const loadTabs = useTabsStore((s) => s.load)

  useEffect(() => {
    async function init() {
      await loadSettings()
      await Promise.all([loadWorkspace(), loadTabs()])
    }
    init()
      .catch((err) => {
        console.error('Failed to initialize workspace', err)
      })
      .finally(() => setReady(true))
  }, [loadSettings, loadWorkspace, loadTabs])

  return ready
}
