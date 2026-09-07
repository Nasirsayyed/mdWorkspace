import { describe, it, expect } from 'vitest'
import { isMarkdownFile, parseFile, extractFolderPath } from './index'

function makeFile(name: string, content: string, size?: number): File {
  const file = new File([content], name, { type: 'text/plain' })
  if (size !== undefined) Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('import service', () => {
  it('accepts markdown-like extensions', () => {
    expect(isMarkdownFile(makeFile('a.md', ''))).toBe(true)
    expect(isMarkdownFile(makeFile('a.markdown', ''))).toBe(true)
    expect(isMarkdownFile(makeFile('a.mdx', ''))).toBe(true)
    expect(isMarkdownFile(makeFile('a.txt', ''))).toBe(true)
    expect(isMarkdownFile(makeFile('a.png', ''))).toBe(false)
    expect(isMarkdownFile(makeFile('a.exe', ''))).toBe(false)
  })

  it('rejects unsupported file types with an error', async () => {
    const result = await parseFile(makeFile('image.png', 'binary'))
    expect(result.error).toBe('Unsupported file type')
  })

  it('rejects oversized files', async () => {
    const result = await parseFile(makeFile('big.md', 'x', 9 * 1024 * 1024))
    expect(result.error).toMatch(/exceeds/i)
  })

  it('reads valid markdown file content', async () => {
    const result = await parseFile(makeFile('notes.md', '# Hello'))
    expect(result.error).toBeUndefined()
    expect(result.content).toBe('# Hello')
  })

  it('extracts a folder path from a relative path', () => {
    expect(extractFolderPath('Docs/Guides/intro.md')).toEqual(['Docs', 'Guides'])
    expect(extractFolderPath('intro.md')).toEqual([])
    expect(extractFolderPath(null)).toEqual([])
  })
})
