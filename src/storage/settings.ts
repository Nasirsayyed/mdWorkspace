import { db } from './db'
import type { WorkspaceSettings } from '@/types'

export const DEFAULT_SETTINGS: WorkspaceSettings = {
  id: 'settings',
  theme: 'system',
  accentColor: 'indigo',
  fontFamily: 'system',
  fontSize: 16,
  lineHeight: 'comfortable',
  contentWidth: 'comfortable',
  sidebarWidth: 260,
  readingWidth: 720,
  defaultView: 'preview',
  showOutline: true,
  showStats: true,
  showBreadcrumbs: true,
  autoSave: '1s',
  autoOpenLastDocument: true,
  confirmDelete: true,
  restoreTabs: true,
  restoreScrollPosition: true,
  density: 'comfortable',
  editorFontSize: 14,
  editorLineHeight: 1.6,
  editorWordWrap: true,
  editorMinimap: false,
  editorLineNumbers: true,
  onboardingComplete: false,
  demoDataRemoved: false,
  sidebarCollapsed: false,
}

export async function getSettings(): Promise<WorkspaceSettings> {
  const existing = await db.settings.get('settings')
  if (existing) return { ...DEFAULT_SETTINGS, ...existing }
  await db.settings.put(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}

export async function updateSettings(changes: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> {
  const current = await getSettings()
  const next = { ...current, ...changes, id: 'settings' as const }
  await db.settings.put(next)
  return next
}

export async function resetSettings(): Promise<WorkspaceSettings> {
  await db.settings.put(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}
