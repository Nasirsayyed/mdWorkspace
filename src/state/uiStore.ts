import { create } from 'zustand'
import type { ID } from '@/types'

export type DialogState =
  | { type: 'confirm'; title: string; message: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean; onConfirm: () => void }
  | { type: 'newDocument'; folderId?: ID | null }
  | { type: 'newFolder'; parentId: ID | null }
  | { type: 'renameFolder'; folderId: ID }
  | { type: 'moveDocument'; documentId: ID }
  | { type: 'versionHistory'; documentId: ID }
  | { type: 'documentInfo'; documentId: ID }
  | { type: 'importDuplicate'; fileName: string; onResolve: (action: 'replace' | 'keep' | 'cancel') => void }

export type FileManagerView = 'grid' | 'list' | 'compact'
export type SortKey = 'updated' | 'created' | 'nameAsc' | 'nameDesc' | 'sizeDesc' | 'sizeAsc' | 'readingTime' | 'opened'

interface UIState {
  sidebarOpen: boolean
  mobileSidebarOpen: boolean
  mobileOutlineOpen: boolean
  outlineOpen: boolean
  focusMode: boolean
  commandPaletteOpen: boolean
  searchOpen: boolean
  settingsOpen: boolean
  activeFolderId: ID | null
  dialog: DialogState | null
  fileManagerView: FileManagerView
  sortKey: SortKey
  tagFilter: string[]
  statsPanelOpen: boolean

  toggleSidebar: () => void
  setMobileSidebarOpen: (v: boolean) => void
  setMobileOutlineOpen: (v: boolean) => void
  toggleOutline: () => void
  toggleFocusMode: () => void
  setFocusMode: (v: boolean) => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  openSearch: () => void
  closeSearch: () => void
  setSettingsOpen: (v: boolean) => void
  setActiveFolder: (id: ID | null) => void
  openDialog: (dialog: DialogState) => void
  closeDialog: () => void
  setFileManagerView: (v: FileManagerView) => void
  setSortKey: (v: SortKey) => void
  setTagFilter: (tags: string[]) => void
  toggleStatsPanel: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  mobileOutlineOpen: false,
  outlineOpen: true,
  focusMode: false,
  commandPaletteOpen: false,
  searchOpen: false,
  settingsOpen: false,
  activeFolderId: null,
  dialog: null,
  fileManagerView: 'list',
  sortKey: 'updated',
  tagFilter: [],
  statsPanelOpen: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
  setMobileOutlineOpen: (v) => set({ mobileOutlineOpen: v }),
  toggleOutline: () => set((s) => ({ outlineOpen: !s.outlineOpen })),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  setFocusMode: (v) => set({ focusMode: v }),
  openCommandPalette: () => set({ commandPaletteOpen: true, searchOpen: false }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  openSearch: () => set({ searchOpen: true, commandPaletteOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  setSettingsOpen: (v) => set({ settingsOpen: v }),
  setActiveFolder: (id) => set({ activeFolderId: id }),
  openDialog: (dialog) => set({ dialog }),
  closeDialog: () => set({ dialog: null }),
  setFileManagerView: (v) => set({ fileManagerView: v }),
  setSortKey: (v) => set({ sortKey: v }),
  setTagFilter: (tags) => set({ tagFilter: tags }),
  toggleStatsPanel: () => set((s) => ({ statsPanelOpen: !s.statsPanelOpen })),
}))

export function confirmDialog(options: {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}): Promise<boolean> {
  return new Promise((resolve) => {
    useUIStore.getState().openDialog({
      type: 'confirm',
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      danger: options.danger,
      onConfirm: () => resolve(true),
    })
    const unsub = useUIStore.subscribe((state, prev) => {
      if (prev.dialog?.type === 'confirm' && state.dialog === null) {
        resolve(false)
        unsub()
      }
    })
  })
}
