import { create } from 'zustand'
import type { Tab, ID, EditorMode } from '@/types'
import * as tabsStorage from '@/storage/tabs'
import { useWorkspaceStore } from './workspaceStore'
import { useSettingsStore } from './settingsStore'
import { addVersion } from '@/storage/versions'

export type SaveStatus = 'saved' | 'saving' | 'unsaved'

interface TabsState {
  tabs: Tab[]
  activeTabId: ID | null
  closedStack: Tab[]
  viewModes: Record<ID, EditorMode>
  drafts: Record<ID, string>
  saveStatus: Record<ID, SaveStatus>
  lastEditAt: Record<ID, number>
  loaded: boolean

  load: () => Promise<void>
  persist: () => Promise<void>

  openDocument: (documentId: ID, opts?: { activate?: boolean }) => Promise<Tab>
  closeTab: (tabId: ID) => Promise<void>
  closeOthers: (tabId: ID) => Promise<void>
  closeAll: () => Promise<void>
  reopenClosed: () => Promise<void>
  setActiveTab: (tabId: ID) => void
  reorderTabs: (fromIndex: number, toIndex: number) => Promise<void>
  togglePinTab: (tabId: ID) => Promise<void>
  setViewMode: (documentId: ID, mode: EditorMode) => void

  setDraft: (documentId: ID, content: string) => void
  discardDraft: (documentId: ID) => void
  saveDocument: (documentId: ID, options?: { snapshot?: boolean }) => Promise<void>
  isDirty: (documentId: ID) => boolean
}

let autosaveTimers: Record<ID, number> = {}
let lastSnapshotAt: Record<ID, number> = {}

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  closedStack: [],
  viewModes: {},
  drafts: {},
  saveStatus: {},
  lastEditAt: {},
  loaded: false,

  load: async () => {
    const restoreTabs = useSettingsStore.getState().settings.restoreTabs
    const tabs = restoreTabs ? await tabsStorage.listTabs() : []
    set({ tabs, loaded: true, activeTabId: tabs.find((t) => t.isPinned)?.id ?? tabs[0]?.id ?? null })
  },

  persist: async () => {
    await tabsStorage.saveTabs(get().tabs)
  },

  openDocument: async (documentId, opts = {}) => {
    const activate = opts.activate ?? true
    const existing = get().tabs.find((t) => t.documentId === documentId)
    let tab = existing
    if (!tab) {
      tab = { id: `tab_${documentId}_${Date.now().toString(36)}`, documentId, isPinned: false, order: get().tabs.length }
      set((s) => ({ tabs: [...s.tabs, tab as Tab] }))
      await get().persist()
    }
    if (activate) set({ activeTabId: tab.id })
    useWorkspaceStore.getState().touchOpened(documentId)
    return tab
  },

  closeTab: async (tabId) => {
    const { tabs, activeTabId, drafts } = get()
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab) return
    const remaining = tabs.filter((t) => t.id !== tabId).map((t, i) => ({ ...t, order: i }))
    const nextDrafts = { ...drafts }
    delete nextDrafts[tab.documentId]

    let nextActive = activeTabId
    if (activeTabId === tabId) {
      const idx = tabs.findIndex((t) => t.id === tabId)
      nextActive = remaining[Math.min(idx, remaining.length - 1)]?.id ?? null
    }

    set((s) => ({
      tabs: remaining,
      activeTabId: nextActive,
      drafts: nextDrafts,
      closedStack: [...s.closedStack, tab].slice(-10),
    }))
    await get().persist()
  },

  closeOthers: async (tabId) => {
    const tabs = get().tabs.filter((t) => t.id === tabId || t.isPinned)
    set({ tabs: tabs.map((t, i) => ({ ...t, order: i })), activeTabId: tabId })
    await get().persist()
  },

  closeAll: async () => {
    const pinned = get().tabs.filter((t) => t.isPinned)
    set({ tabs: pinned.map((t, i) => ({ ...t, order: i })), activeTabId: pinned[0]?.id ?? null, drafts: {} })
    await get().persist()
  },

  reopenClosed: async () => {
    const stack = [...get().closedStack]
    const tab = stack.pop()
    if (!tab) return
    set((s) => ({
      tabs: [...s.tabs, { ...tab, order: s.tabs.length }],
      closedStack: stack,
      activeTabId: tab.id,
    }))
    await get().persist()
  },

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  reorderTabs: async (fromIndex, toIndex) => {
    const tabs = [...get().tabs].sort((a, b) => a.order - b.order)
    const [moved] = tabs.splice(fromIndex, 1)
    tabs.splice(toIndex, 0, moved)
    const reordered = tabs.map((t, i) => ({ ...t, order: i }))
    set({ tabs: reordered })
    await get().persist()
  },

  togglePinTab: async (tabId) => {
    set((s) => ({ tabs: s.tabs.map((t) => (t.id === tabId ? { ...t, isPinned: !t.isPinned } : t)) }))
    await get().persist()
  },

  setViewMode: (documentId, mode) => set((s) => ({ viewModes: { ...s.viewModes, [documentId]: mode } })),

  setDraft: (documentId, content) => {
    set((s) => ({
      drafts: { ...s.drafts, [documentId]: content },
      saveStatus: { ...s.saveStatus, [documentId]: 'unsaved' },
      lastEditAt: { ...s.lastEditAt, [documentId]: Date.now() },
    }))

    const autoSave = useSettingsStore.getState().settings.autoSave
    window.clearTimeout(autosaveTimers[documentId])
    if (autoSave === 'off') return

    const delay = autoSave === '1s' ? 1000 : autoSave === '3s' ? 3000 : 5000
    autosaveTimers[documentId] = window.setTimeout(() => {
      get().saveDocument(documentId)
    }, delay)
  },

  discardDraft: (documentId) => {
    window.clearTimeout(autosaveTimers[documentId])
    set((s) => {
      const drafts = { ...s.drafts }
      delete drafts[documentId]
      const saveStatus = { ...s.saveStatus }
      delete saveStatus[documentId]
      return { drafts, saveStatus }
    })
  },

  saveDocument: async (documentId, options = {}) => {
    const draft = get().drafts[documentId]
    if (draft === undefined) return
    set((s) => ({ saveStatus: { ...s.saveStatus, [documentId]: 'saving' } }))

    const shouldSnapshot =
      options.snapshot ?? (!lastSnapshotAt[documentId] || Date.now() - lastSnapshotAt[documentId] > 5 * 60 * 1000)

    await useWorkspaceStore.getState().updateDocument(documentId, { content: draft }, { snapshot: shouldSnapshot })
    if (shouldSnapshot) lastSnapshotAt[documentId] = Date.now()

    set((s) => {
      const drafts = { ...s.drafts }
      delete drafts[documentId]
      return { drafts, saveStatus: { ...s.saveStatus, [documentId]: 'saved' } }
    })
  },

  isDirty: (documentId) => get().drafts[documentId] !== undefined,
}))

export async function forceSnapshot(documentId: ID, content: string): Promise<void> {
  await addVersion(documentId, content, 'Manual save')
  lastSnapshotAt[documentId] = Date.now()
}

export function resetAutosaveTimers(): void {
  Object.values(autosaveTimers).forEach((t) => window.clearTimeout(t))
  autosaveTimers = {}
  lastSnapshotAt = {}
}
