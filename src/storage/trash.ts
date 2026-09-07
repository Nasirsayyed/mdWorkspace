import { db } from './db'
import type { MDDocument, ID } from '@/types'

export async function listTrash(): Promise<MDDocument[]> {
  const items = await db.trash.toArray()
  return items.sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0))
}

export async function restoreFromTrash(id: ID): Promise<MDDocument | undefined> {
  return db.transaction('rw', db.trash, db.documents, db.folders, async () => {
    const doc = await db.trash.get(id)
    if (!doc) return undefined

    let folderId = doc.folderId
    if (folderId) {
      const folder = await db.folders.get(folderId)
      if (!folder) folderId = null
    }

    const restored: MDDocument = { ...doc, folderId, deletedAt: null }
    await db.documents.put(restored)
    await db.trash.delete(id)
    return restored
  })
}

export async function deletePermanently(id: ID): Promise<void> {
  await db.trash.delete(id)
}

export async function emptyTrash(): Promise<void> {
  await db.trash.clear()
}

export async function trashCount(): Promise<number> {
  return db.trash.count()
}
