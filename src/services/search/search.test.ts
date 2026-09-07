import { describe, it, expect } from 'vitest'
import { buildSearchIndex, search } from './index'
import type { MDDocument } from '@/types'

function makeDoc(overrides: Partial<MDDocument>): MDDocument {
  return {
    id: overrides.id ?? 'id',
    name: overrides.name ?? 'Doc.md',
    content: overrides.content ?? '',
    folderId: overrides.folderId ?? null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastOpenedAt: null,
    isFavorite: false,
    isPinned: false,
    tags: overrides.tags ?? [],
    wordCount: 0,
    characterCount: 0,
    readingTime: 1,
    version: 1,
    ...overrides,
  }
}

describe('search service', () => {
  const docs = [
    makeDoc({ id: '1', name: 'API Reference.md', content: 'Authentication endpoints and rate limits.', tags: ['api'] }),
    makeDoc({ id: '2', name: 'WMS Operations.md', content: 'Warehouse zones and cycle counts.', tags: ['wms'] }),
    makeDoc({ id: '3', name: 'Troubleshooting.md', content: 'Storage limit reached errors.', tags: ['support'] }),
  ]

  it('finds documents by filename', () => {
    const fuse = buildSearchIndex(docs, [])
    const results = search(fuse, 'API')
    expect(results[0].documentId).toBe('1')
  })

  it('finds documents by content', () => {
    const fuse = buildSearchIndex(docs, [])
    const results = search(fuse, 'warehouse zones')
    expect(results.some((r) => r.documentId === '2')).toBe(true)
  })

  it('fuzzy matches slightly misspelled queries', () => {
    const fuse = buildSearchIndex(docs, [])
    const results = search(fuse, 'operatons')
    expect(results.some((r) => r.documentId === '2')).toBe(true)
  })

  it('returns nothing for an empty query', () => {
    const fuse = buildSearchIndex(docs, [])
    expect(search(fuse, '')).toEqual([])
  })
})
