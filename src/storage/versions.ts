import { db } from './db'
import type { DocumentVersion, ID } from '@/types'
import { createId } from '@/utils/id'

const MAX_VERSIONS_PER_DOC = 50

export async function addVersion(documentId: ID, content: string, label?: string): Promise<DocumentVersion> {
  const version: DocumentVersion = {
    id: createId('ver'),
    documentId,
    content,
    createdAt: Date.now(),
    label,
  }
  await db.versions.add(version)

  const all = await db.versions.where('documentId').equals(documentId).sortBy('createdAt')
  if (all.length > MAX_VERSIONS_PER_DOC) {
    const excess = all.slice(0, all.length - MAX_VERSIONS_PER_DOC)
    await db.versions.bulkDelete(excess.map((v) => v.id))
  }

  return version
}

export async function listVersions(documentId: ID): Promise<DocumentVersion[]> {
  const versions = await db.versions.where('documentId').equals(documentId).toArray()
  return versions.sort((a, b) => b.createdAt - a.createdAt)
}

export async function getVersion(id: ID): Promise<DocumentVersion | undefined> {
  return db.versions.get(id)
}

export async function deleteVersionsForDocument(documentId: ID): Promise<void> {
  const versions = await db.versions.where('documentId').equals(documentId).toArray()
  await db.versions.bulkDelete(versions.map((v) => v.id))
}
