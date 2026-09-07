import type { DocumentStats } from '@/types'

const WORDS_PER_MINUTE = 200

export function countWords(content: string): number {
  const stripped = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .trim()
  if (!stripped) return 0
  const matches = stripped.match(/[\p{L}\p{N}_'-]+/gu)
  return matches ? matches.length : 0
}

export function countCharacters(content: string): number {
  return content.length
}

export function countCharactersNoSpaces(content: string): number {
  return content.replace(/\s/g, '').length
}

export function countLines(content: string): number {
  if (content === '') return 0
  return content.split('\n').length
}

export function estimateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
}

export function computeDocumentStats(content: string): DocumentStats {
  const words = countWords(content)
  const headings = (content.match(/^#{1,6}\s+.+$/gm) ?? []).length
  const links = (content.match(/\[[^\]]*\]\([^)]+\)/g) ?? []).length
  const images = (content.match(/!\[[^\]]*\]\([^)]+\)/g) ?? []).length
  const codeBlocks = Math.floor((content.match(/```/g) ?? []).length / 2)

  return {
    words,
    characters: countCharacters(content),
    charactersNoSpaces: countCharactersNoSpaces(content),
    lines: countLines(content),
    headings,
    links: Math.max(0, links - images),
    images,
    codeBlocks,
    readingTime: estimateReadingTime(words),
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / Math.pow(1024, i)
  return `${i === 0 ? value : value.toFixed(1)} ${units[i]}`
}

export function byteSize(content: string): number {
  return new Blob([content]).size
}

export function formatRelativeTime(timestamp: number | null | undefined): string {
  if (!timestamp) return 'Never'
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  if (seconds < 5) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  return formatDate(timestamp)
}

export function formatDate(timestamp: number | null | undefined): string {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(timestamp: number | null | undefined): string {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function titleFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/i, '')
}

export function ensureMdExtension(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return 'Untitled.md'
  return /\.(md|markdown|mdx|txt)$/i.test(trimmed) ? trimmed : `${trimmed}.md`
}

export function extractTitle(content: string, fallback: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : fallback
}

export function highlightMatches(text: string, query: string): { text: string; matched: boolean }[] {
  if (!query.trim()) return [{ text, matched: false }]
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'ig'))
  return parts.filter((p) => p.length > 0).map((part) => ({
    text: part,
    matched: part.toLowerCase() === query.toLowerCase(),
  }))
}

export function excerpt(content: string, length = 140): string {
  const stripped = content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>#[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (stripped.length <= length) return stripped
  return `${stripped.slice(0, length).trim()}…`
}
