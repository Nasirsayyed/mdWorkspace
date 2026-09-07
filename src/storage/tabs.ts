import { db } from './db'
import type { Tab, ID } from '@/types'
import { createId } from '@/utils/id'

export async function listTabs(): Promise<Tab[]> {
  const tabs = await db.tabs.toArray()
  return tabs.sort((a, b) => a.order - b.order)
}

export async function saveTabs(tabs: Tab[]): Promise<void> {
  await db.transaction('rw', db.tabs, async () => {
    await db.tabs.clear()
    await db.tabs.bulkAdd(tabs)
  })
}

export async function addTab(documentId: ID): Promise<Tab> {
  const existing = await db.tabs.where('documentId').equals(documentId).first()
  if (existing) return existing
  const all = await listTabs()
  const tab: Tab = {
    id: createId('tab'),
    documentId,
    isPinned: false,
    order: all.length,
  }
  await db.tabs.add(tab)
  return tab
}

export async function removeTab(id: ID): Promise<void> {
  await db.tabs.delete(id)
}

export async function clearTabs(): Promise<void> {
  await db.tabs.clear()
}
