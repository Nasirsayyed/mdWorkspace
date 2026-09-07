import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'
import { createDocument, updateDocument, duplicateDocument, softDeleteDocument, renameDocument, findByName } from './documents'
import { restoreFromTrash, listTrash } from './trash'
import { listVersions } from './versions'

beforeEach(async () => {
  await db.documents.clear()
  await db.trash.clear()
  await db.versions.clear()
})

describe('documents storage', () => {
  it('creates a document with computed stats', async () => {
    const doc = await createDocument({ name: 'Test.md', content: 'Hello world, this is a test.' })
    expect(doc.id).toBeTruthy()
    expect(doc.wordCount).toBe(6)
    expect(doc.characterCount).toBe(28)
    expect(doc.version).toBe(1)
  })

  it('updates content, bumps version, and recomputes stats', async () => {
    const doc = await createDocument({ name: 'Test.md', content: 'one two three' })
    const updated = await updateDocument(doc.id, { content: 'one two three four five' })
    expect(updated?.version).toBe(2)
    expect(updated?.wordCount).toBe(5)
  })

  it('does not bump version when content is unchanged', async () => {
    const doc = await createDocument({ name: 'Test.md', content: 'same' })
    const updated = await updateDocument(doc.id, { name: 'Renamed.md' })
    expect(updated?.version).toBe(1)
    expect(updated?.name).toBe('Renamed.md')
  })

  it('saves a version snapshot when snapshot option is set', async () => {
    const doc = await createDocument({ name: 'Test.md', content: 'v1' })
    await updateDocument(doc.id, { content: 'v2' }, { snapshot: true })
    const versions = await listVersions(doc.id)
    expect(versions).toHaveLength(1)
    expect(versions[0].content).toBe('v1')
  })

  it('duplicates a document with a new id and "copy" suffix', async () => {
    const doc = await createDocument({ name: 'Original.md', content: 'content' })
    const copy = await duplicateDocument(doc.id)
    expect(copy?.id).not.toBe(doc.id)
    expect(copy?.name).toBe('Original copy.md')
  })

  it('renames a document', async () => {
    const doc = await createDocument({ name: 'A.md', content: '' })
    await renameDocument(doc.id, 'B.md')
    const found = await findByName('B.md', null)
    expect(found?.id).toBe(doc.id)
  })

  it('soft-deletes to trash and can be restored', async () => {
    const doc = await createDocument({ name: 'Deleteme.md', content: 'x' })
    await softDeleteDocument(doc.id)

    const trashed = await listTrash()
    expect(trashed.some((d) => d.id === doc.id)).toBe(true)

    const stillInDocs = await db.documents.get(doc.id)
    expect(stillInDocs).toBeUndefined()

    const restored = await restoreFromTrash(doc.id)
    expect(restored?.id).toBe(doc.id)
    const backInDocs = await db.documents.get(doc.id)
    expect(backInDocs).toBeDefined()
  })
})
