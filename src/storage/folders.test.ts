import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'
import { createFolder, deleteFolder, moveFolder } from './folders'
import { createDocument } from './documents'

beforeEach(async () => {
  await db.folders.clear()
  await db.documents.clear()
})

describe('folders storage', () => {
  it('creates nested folders', async () => {
    const parent = await createFolder({ name: 'Docs' })
    const child = await createFolder({ name: 'Guides', parentId: parent.id })
    expect(child.parentId).toBe(parent.id)
  })

  it('moving documents to All Documents when their folder is deleted', async () => {
    const folder = await createFolder({ name: 'Temp' })
    const doc = await createDocument({ name: 'Doc.md', content: '', folderId: folder.id })
    await deleteFolder(folder.id, null)

    const updated = await db.documents.get(doc.id)
    expect(updated?.folderId).toBeNull()
    const remainingFolder = await db.folders.get(folder.id)
    expect(remainingFolder).toBeUndefined()
  })

  it('reparents a folder', async () => {
    const a = await createFolder({ name: 'A' })
    const b = await createFolder({ name: 'B' })
    await moveFolder(b.id, a.id)
    const updated = await db.folders.get(b.id)
    expect(updated?.parentId).toBe(a.id)
  })
})
