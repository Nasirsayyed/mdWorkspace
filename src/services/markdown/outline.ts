import GithubSlugger from 'github-slugger'

export interface OutlineItem {
  id: string
  level: number
  text: string
}

export function extractOutline(content: string): OutlineItem[] {
  const slugger = new GithubSlugger()
  const lines = content.split('\n')
  const items: OutlineItem[] = []
  let inCodeFence = false

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inCodeFence = !inCodeFence
      continue
    }
    if (inCodeFence) continue

    const match = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line)
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/[*_`~]/g, '').trim()
      if (!text) continue
      items.push({ id: slugger.slug(text), level, text })
    }
  }

  return items
}
