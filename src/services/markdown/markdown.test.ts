import { describe, it, expect } from 'vitest'
import { markdownToHtmlFragment } from './toHtml'
import { extractOutline } from './outline'

describe('markdown rendering', () => {
  it('strips javascript: URLs from links', () => {
    const html = markdownToHtmlFragment('[click me](javascript:alert(1))')
    expect(html).not.toContain('javascript:')
  })

  it('does not render raw script tags from markdown source', () => {
    const html = markdownToHtmlFragment('<script>alert(1)</script>\n\nHello')
    expect(html).not.toContain('<script>')
  })

  it('generates matching ids for headings used by the outline', () => {
    const html = markdownToHtmlFragment('# Getting Started\n\n## Installation')
    expect(html).toContain('id="getting-started"')
    expect(html).toContain('id="installation"')
  })

  it('renders GFM tables, task lists and fenced code blocks', () => {
    const html = markdownToHtmlFragment('| A | B |\n| --- | --- |\n| 1 | 2 |\n\n- [x] done\n- [ ] todo\n\n```js\nconst x = 1;\n```')
    expect(html).toContain('<table>')
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('<pre>')
  })
})

describe('outline extraction', () => {
  it('extracts headings with matching slug ids', () => {
    const items = extractOutline('# Title\n\n## Sub Heading\n\nSome text\n\n### Deep')
    expect(items).toEqual([
      { id: 'title', level: 1, text: 'Title' },
      { id: 'sub-heading', level: 2, text: 'Sub Heading' },
      { id: 'deep', level: 3, text: 'Deep' },
    ])
  })

  it('ignores headings inside fenced code blocks', () => {
    const items = extractOutline('# Real\n\n```\n# Not a heading\n```')
    expect(items).toHaveLength(1)
    expect(items[0].text).toBe('Real')
  })
})
