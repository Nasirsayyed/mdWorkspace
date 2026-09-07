import { describe, it, expect } from 'vitest'
import { countWords, computeDocumentStats, formatBytes, slugify, ensureMdExtension, excerpt } from './text'

describe('text utils', () => {
  it('counts words, ignoring code fences', () => {
    expect(countWords('one two three')).toBe(3)
    expect(countWords('one ```two three``` four')).toBe(2)
  })

  it('computes document stats', () => {
    const stats = computeDocumentStats('# Heading\n\nSome [link](https://x.com) and ![image](https://x.com/i.png).\n\n```js\ncode\n```')
    expect(stats.headings).toBe(1)
    expect(stats.links).toBe(1)
    expect(stats.images).toBe(1)
    expect(stats.codeBlocks).toBe(1)
  })

  it('formats bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(1024)).toBe('1.0 KB')
  })

  it('slugifies text', () => {
    expect(slugify('Hello, World!')).toBe('hello-world')
  })

  it('ensures a .md extension', () => {
    expect(ensureMdExtension('README')).toBe('README.md')
    expect(ensureMdExtension('README.md')).toBe('README.md')
    expect(ensureMdExtension('notes.markdown')).toBe('notes.markdown')
  })

  it('builds a plain-text excerpt from markdown', () => {
    const result = excerpt('# Title\n\n**Bold** and _italic_ text here.', 50)
    expect(result).not.toContain('#')
    expect(result).not.toContain('*')
  })
})
