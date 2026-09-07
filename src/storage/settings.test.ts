import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'
import { getSettings, updateSettings, DEFAULT_SETTINGS } from './settings'

beforeEach(async () => {
  await db.settings.clear()
})

describe('settings storage', () => {
  it('returns defaults on first read and persists them', async () => {
    const settings = await getSettings()
    expect(settings).toEqual(DEFAULT_SETTINGS)
    const stored = await db.settings.get('settings')
    expect(stored).toBeDefined()
  })

  it('merges partial updates', async () => {
    await getSettings()
    const updated = await updateSettings({ theme: 'dark', accentColor: 'teal' })
    expect(updated.theme).toBe('dark')
    expect(updated.accentColor).toBe('teal')
    expect(updated.fontSize).toBe(DEFAULT_SETTINGS.fontSize)
  })
})
