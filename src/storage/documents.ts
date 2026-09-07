import { db } from './db'
import type { MDDocument, ID } from '@/types'
import { createId } from '@/utils/id'
import { computeDocumentStats } from '@/utils/text'
import { addVersion } from './versions'

export interface CreateDocumentInput {
  name: string
  content?: string
  folderId?: ID | null
  tags?: string[]
  isDemo?: boolean
}

function withStats(doc: Omit<MDDocument, 'wordCount' | 'characterCount' | 'readingTime'>): MDDocument {
  const stats = computeDocumentStats(doc.content)
  return {
    ...doc,
    wordCount: stats.words,
    characterCount: stats.characters,
    readingTime: stats.readingTime,
  }
}

export async function listDocuments(): Promise<MDDocument[]> {
  return db.documents.toArray()
}

export async function getDocument(id: ID): Promise<MDDocument | undefined> {
  return db.documents.get(id)
}

export async function createDocument(input: CreateDocumentInput): Promise<MDDocument> {
  const now = Date.now()
  const doc = withStats({
    id: createId('doc'),
    name: input.name,
    content: input.content ?? '',
    folderId: input.folderId ?? null,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: null,
    isFavorite: false,
    isPinned: false,
    tags: input.tags ?? [],
    version: 1,
    isDemo: input.isDemo ?? false,
    readingProgress: 0,
  })
  await db.documents.add(doc)
  return doc
}

export async function updateDocument(
  id: ID,
  changes: Partial<Pick<MDDocument, 'name' | 'content' | 'folderId' | 'tags' | 'isFavorite' | 'isPinned' | 'readingProgress'>>,
  options: { snapshot?: boolean; touch?: boolean } = {},
): Promise<MDDocument | undefined> {
  return db.transaction('rw', db.documents, db.versions, async () => {
    const existing = await db.documents.get(id)
    if (!existing) return undefined

    const touch = options.touch ?? true
    const next: MDDocument = {
      ...existing,
      ...changes,
      updatedAt: touch ? Date.now() : existing.updatedAt,
      version: changes.content !== undefined && changes.content !== existing.content ? existing.version + 1 : existing.version,
    }

    if (changes.content !== undefined) {
      const stats = computeDocumentStats(changes.content)
      next.wordCount = stats.words
      next.characterCount = stats.characters
      next.readingTime = stats.readingTime
    }

    await db.documents.put(next)

    if (options.snapshot && changes.content !== undefined && changes.content !== existing.content) {
      await addVersion(id, existing.content)
    }

    return next
  })
}

export async function touchOpened(id: ID): Promise<void> {
  await db.documents.update(id, { lastOpenedAt: Date.now() })
}

export async function setReadingProgress(id: ID, progress: number): Promise<void> {
  await db.documents.update(id, { readingProgress: Math.max(0, Math.min(1, progress)) })
}

export async function moveDocumentToFolder(id: ID, folderId: ID | null): Promise<void> {
  await db.documents.update(id, { folderId, updatedAt: Date.now() })
}

export async function duplicateDocument(id: ID): Promise<MDDocument | undefined> {
  const original = await db.documents.get(id)
  if (!original) return undefined
  const now = Date.now()
  const copy = withStats({
    ...original,
    id: createId('doc'),
    name: nextDuplicateName(original.name),
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: null,
    isPinned: false,
    version: 1,
  })
  await db.documents.add(copy)
  return copy
}

function nextDuplicateName(name: string): string {
  const match = name.match(/^(.*?)(\.mdx?)$/i)
  const base = match ? match[1] : name
  const ext = match ? match[2] : ''
  return `${base} copy${ext}`
}

export async function renameDocument(id: ID, name: string): Promise<void> {
  await db.documents.update(id, { name, updatedAt: Date.now() })
}

export async function softDeleteDocument(id: ID): Promise<void> {
  await db.transaction('rw', db.documents, db.trash, async () => {
    const doc = await db.documents.get(id)
    if (!doc) return
    await db.trash.put({ ...doc, deletedAt: Date.now() })
    await db.documents.delete(id)
  })
}

export async function softDeleteMany(ids: ID[]): Promise<void> {
  await db.transaction('rw', db.documents, db.trash, async () => {
    for (const id of ids) {
      const doc = await db.documents.get(id)
      if (!doc) continue
      await db.trash.put({ ...doc, deletedAt: Date.now() })
      await db.documents.delete(id)
    }
  })
}

export async function findByName(name: string, folderId: ID | null): Promise<MDDocument | undefined> {
  return db.documents.filter((d) => d.name === name && d.folderId === folderId).first()
}

export async function bulkAdd(docs: MDDocument[]): Promise<void> {
  await db.documents.bulkPut(docs)
}

export async function documentCount(): Promise<number> {
  return db.documents.count()
}
