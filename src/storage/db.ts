import Dexie, { type EntityTable } from 'dexie'
import type { MDDocument, Folder, WorkspaceSettings, Tab, DocumentVersion } from '@/types'

export class MarkdownWorkspaceDB extends Dexie {
  documents!: EntityTable<MDDocument, 'id'>
  folders!: EntityTable<Folder, 'id'>
  settings!: EntityTable<WorkspaceSettings, 'id'>
  tabs!: EntityTable<Tab, 'id'>
  versions!: EntityTable<DocumentVersion, 'id'>
  trash!: EntityTable<MDDocument, 'id'>

  constructor() {
    super('markdown-workspace')

    this.version(1).stores({
      documents: 'id, name, folderId, updatedAt, createdAt, lastOpenedAt, isFavorite, isPinned, *tags',
      folders: 'id, parentId, name, updatedAt',
      settings: 'id',
      tabs: 'id, documentId, order',
      versions: 'id, documentId, createdAt',
      trash: 'id, name, folderId, deletedAt',
    })
  }
}

export const db = new MarkdownWorkspaceDB()

export async function getStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
  if (navigator.storage?.estimate) {
    const estimate = await navigator.storage.estimate()
    return { usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 }
  }
  return null
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', [db.documents, db.folders, db.settings, db.tabs, db.versions, db.trash], async () => {
    await Promise.all([
      db.documents.clear(),
      db.folders.clear(),
      db.settings.clear(),
      db.tabs.clear(),
      db.versions.clear(),
      db.trash.clear(),
    ])
  })
}
