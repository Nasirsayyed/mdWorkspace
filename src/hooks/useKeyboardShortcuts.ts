import { useEffect } from 'react'
import { useUIStore } from '@/state/uiStore'
import { useTabsStore } from '@/state/tabsStore'
import { useActiveDocument } from './useActiveDocument'
import { useViewMode } from './useViewMode'

function isModKey(e: KeyboardEvent): boolean {
  return e.metaKey || e.ctrlKey
}

export function useKeyboardShortcuts() {
  const openSearch = useUIStore((s) => s.openSearch)
  const searchOpen = useUIStore((s) => s.searchOpen)
  const closeSearch = useUIStore((s) => s.closeSearch)
  const openCommandPalette = useUIStore((s) => s.openCommandPalette)
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen)
  const closeCommandPalette = useUIStore((s) => s.closeCommandPalette)
  const openDialog = useUIStore((s) => s.openDialog)
  const dialog = useUIStore((s) => s.dialog)
  const closeDialog = useUIStore((s) => s.closeDialog)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode)
  const focusMode = useUIStore((s) => s.focusMode)
  const setFocusMode = useUIStore((s) => s.setFocusMode)

  const activeTabId = useTabsStore((s) => s.activeTabId)
  const closeTab = useTabsStore((s) => s.closeTab)
  const reopenClosed = useTabsStore((s) => s.reopenClosed)
  const saveDocument = useTabsStore((s) => s.saveDocument)
  const doc = useActiveDocument()
  const [viewMode, setViewMode] = useViewMode(doc?.id)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = isModKey(e)

      if (e.key === 'Escape') {
        if (searchOpen) return closeSearch()
        if (commandPaletteOpen) return closeCommandPalette()
        if (dialog) return closeDialog()
        if (focusMode) return setFocusMode(false)
        return
      }

      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        return openSearch()
      }

      if (mod && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        return openCommandPalette()
      }

      if (mod && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        return openDialog({ type: 'newDocument' })
      }

      if (mod && e.key.toLowerCase() === '\\') {
        e.preventDefault()
        return toggleSidebar()
      }

      if (mod && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        return toggleFocusMode()
      }

      if (mod && !e.shiftKey && e.key.toLowerCase() === 's') {
        if (doc) {
          e.preventDefault()
          saveDocument(doc.id, { snapshot: true })
        }
        return
      }

      if (mod && !e.shiftKey && e.key.toLowerCase() === 'w') {
        if (activeTabId) {
          e.preventDefault()
          closeTab(activeTabId)
        }
        return
      }

      if (mod && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault()
        return reopenClosed()
      }

      if (mod && e.shiftKey && e.key.toLowerCase() === 'e') {
        if (doc) {
          e.preventDefault()
          setViewMode(viewMode === 'split' ? 'edit' : 'split')
        }
        return
      }

    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    openSearch,
    searchOpen,
    closeSearch,
    openCommandPalette,
    commandPaletteOpen,
    closeCommandPalette,
    openDialog,
    dialog,
    closeDialog,
    toggleSidebar,
    toggleFocusMode,
    focusMode,
    setFocusMode,
    activeTabId,
    closeTab,
    reopenClosed,
    saveDocument,
    doc,
    viewMode,
    setViewMode,
  ])
}
