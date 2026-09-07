import { useTabsStore } from '@/state/tabsStore'
import { useSettingsStore } from '@/state/settingsStore'
import type { EditorMode, ID } from '@/types'

export function useViewMode(documentId: ID | undefined): [EditorMode, (mode: EditorMode) => void] {
  const viewModes = useTabsStore((s) => s.viewModes)
  const setViewModeAction = useTabsStore((s) => s.setViewMode)
  const defaultView = useSettingsStore((s) => s.settings.defaultView)

  if (!documentId) return [defaultView, () => {}]
  const mode = viewModes[documentId] ?? defaultView
  return [mode, (m: EditorMode) => setViewModeAction(documentId, m)]
}
