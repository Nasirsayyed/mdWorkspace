import { db } from './db'
import type { Folder, ID } from '@/types'
import { createId } from '@/utils/id'

export interface CreateFolderInput {
  name: string
  parentId?: ID | null
  color?: string | null
  icon?: string | null
}

export async function listFolders(): Promise<Folder[]> {
  return db.folders.toArray()
}

export async function createFolder(input: CreateFolderInput): Promise<Folder> {
  const now = Date.now()
  const folder: Folder = {
    id: createId('fld'),
    name: input.name,
    parentId: input.parentId ?? null,
    createdAt: now,
    updatedAt: now,
    color: input.color ?? null,
    icon: input.icon ?? null,
  }
  await db.folders.add(folder)
  return folder
}

export async function renameFolder(id: ID, name: string): Promise<void> {
  await db.folders.update(id, { name, updatedAt: Date.now() })
}

export async function updateFolder(
  id: ID,
  changes: Partial<Pick<Folder, 'name' | 'color' | 'icon' | 'parentId'>>,
): Promise<void> {
  await db.folders.update(id, { ...changes, updatedAt: Date.now() })
}

export async function moveFolder(id: ID, parentId: ID | null): Promise<void> {
  if (parentId === id) return
  await db.folders.update(id, { parentId, updatedAt: Date.now() })
}

function collectDescendantIds(id: ID, all: Folder[]): ID[] {
  const children = all.filter((f) => f.parentId === id)
  return children.flatMap((c) => [c.id, ...collectDescendantIds(c.id, all)])
}

export async function deleteFolder(id: ID, moveDocsTo: ID | null = null): Promise<void> {
  await db.transaction('rw', db.folders, db.documents, async () => {
    const all = await db.folders.toArray()
    const idsToDelete = [id, ...collectDescendantIds(id, all)]
    const docs = await db.documents.where('folderId').anyOf(idsToDelete).toArray()
    await Promise.all(docs.map((d) => db.documents.update(d.id, { folderId: moveDocsTo })))
    await db.folders.bulkDelete(idsToDelete)
  })
}

export async function bulkAddFolders(folders: Folder[]): Promise<void> {
  await db.folders.bulkPut(folders)
}
