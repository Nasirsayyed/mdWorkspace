import { describe, it, expect } from 'vitest'
import { diffLines } from './diff'

describe('diffLines', () => {
  it('marks unchanged text as equal', () => {
    const ops = diffLines('a\nb\nc', 'a\nb\nc')
    expect(ops.every((op) => op.type === 'equal')).toBe(true)
  })

  it('detects additions', () => {
    const ops = diffLines('a\nb', 'a\nb\nc')
    expect(ops.find((op) => op.type === 'add')?.line).toBe('c')
  })

  it('detects removals', () => {
    const ops = diffLines('a\nb\nc', 'a\nc')
    expect(ops.find((op) => op.type === 'remove')?.line).toBe('b')
  })
})
