import Fuse, { type IFuseOptions } from 'fuse.js'
import type { MDDocument, Folder, SearchResultItem } from '@/types'
import { excerpt } from '@/utils/text'

interface SearchDoc {
  id: string
  name: string
  content: string
  tags: string
  folderName: string
}

const options: IFuseOptions<SearchDoc> = {
  keys: [
    { name: 'name', weight: 0.45 },
    { name: 'tags', weight: 0.2 },
    { name: 'folderName', weight: 0.1 },
    { name: 'content', weight: 0.25 },
  ],
  threshold: 0.36,
  ignoreLocation: true,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
}

export function buildSearchIndex(documents: MDDocument[], folders: Folder[]) {
  const folderMap = new Map(folders.map((f) => [f.id, f.name]))
  const items: SearchDoc[] = documents.map((d) => ({
    id: d.id,
    name: d.name,
    content: d.content,
    tags: d.tags.join(' '),
    folderName: d.folderId ? (folderMap.get(d.folderId) ?? '') : '',
  }))
  return new Fuse(items, options)
}

export function search(fuse: Fuse<SearchDoc>, query: string, limit = 20): SearchResultItem[] {
  if (!query.trim()) return []
  const results = fuse.search(query, { limit })

  return results.map((r) => {
    const nameMatch = r.matches?.some((m) => m.key === 'name')
    const tagMatch = r.matches?.some((m) => m.key === 'tags')
    const matchType: SearchResultItem['matchType'] = nameMatch ? 'name' : tagMatch ? 'tag' : 'content'

    let snippet = excerpt(r.item.content, 120)
    const contentMatch = r.matches?.find((m) => m.key === 'content')
    if (contentMatch?.value) {
      const idx = contentMatch.indices[0]
      if (idx) {
        const start = Math.max(0, idx[0] - 40)
        snippet = `…${r.item.content.slice(start, idx[1] + 60).replace(/\s+/g, ' ')}…`
      }
    }

    return {
      documentId: r.item.id,
      name: r.item.name,
      folderName: r.item.folderName || null,
      snippet,
      matchType,
      score: r.score ?? 1,
    }
  })
}
