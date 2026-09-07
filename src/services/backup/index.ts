import { saveAs } from 'file-saver'
import { db } from '@/storage/db'
import { getSettings } from '@/storage/settings'
import type { WorkspaceBackup } from '@/types'

export async function exportWorkspace(): Promise<WorkspaceBackup> {
  const [documents, folders, settings, versions, tabs] = await Promise.all([
    db.documents.toArray(),
    db.folders.toArray(),
    getSettings(),
    db.versions.toArray(),
    db.tabs.toArray(),
  ])

  return {
    formatVersion: 1,
    exportedAt: Date.now(),
    documents,
    folders,
    settings,
    versions,
    tabs,
  }
}

export async function downloadWorkspaceBackup(): Promise<void> {
  const backup = await exportWorkspace()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const date = new Date().toISOString().slice(0, 10)
  saveAs(blob, `markdown-workspace-backup-${date}.json`)
}

export function isValidBackup(data: unknown): data is WorkspaceBackup {
  if (!data || typeof data !== 'object') return false
  const backup = data as Partial<WorkspaceBackup>
  return (
    backup.formatVersion === 1 &&
    Array.isArray(backup.documents) &&
    Array.isArray(backup.folders) &&
    typeof backup.settings === 'object'
  )
}

export async function restoreWorkspace(backup: WorkspaceBackup): Promise<void> {
  await db.transaction('rw', [db.documents, db.folders, db.settings, db.versions, db.tabs, db.trash], async () => {
    await Promise.all([db.documents.clear(), db.folders.clear(), db.tabs.clear(), db.versions.clear(), db.trash.clear()])
    await db.folders.bulkAdd(backup.folders)
    await db.documents.bulkAdd(backup.documents)
    if (backup.versions?.length) await db.versions.bulkAdd(backup.versions)
    if (backup.tabs?.length) await db.tabs.bulkAdd(backup.tabs)
    await db.settings.put({ ...backup.settings, id: 'settings' })
  })
}

export async function parseBackupFile(file: File): Promise<WorkspaceBackup> {
  const text = await file.text()
  const data = JSON.parse(text)
  if (!isValidBackup(data)) throw new Error('This file is not a valid Markdown Workspace backup.')
  return data
}
