import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FilePlus, Upload, FolderInput, Save, Pencil, Copy, Trash2, FolderInput as MoveIcon, PanelLeft, PanelRight,
  Sun, Edit3, Eye, Columns2, Search as SearchIcon, Replace, FileDown, FileCode, Printer, ZoomIn, ZoomOut,
  RotateCcw, BarChart3, Settings as SettingsIcon, Maximize2,
} from 'lucide-react'
import { useUIStore, confirmDialog } from '@/state/uiStore'
import { useSettingsStore } from '@/state/settingsStore'
import { useTabsStore } from '@/state/tabsStore'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useActiveDocument } from './useActiveDocument'
import { useFilePicker } from './useFilePicker'
import { useViewMode } from './useViewMode'
import { downloadMarkdown, downloadHtml, printDocument } from '@/services/export'
import { dispatchEditorCommand, EDITOR_FIND_EVENT, EDITOR_REPLACE_EVENT, RENAME_ACTIVE_DOCUMENT_EVENT } from '@/utils/events'
import type { ThemeMode } from '@/types'

export interface Command {
  id: string
  label: string
  group: string
  icon: React.ComponentType<{ size?: number }>
  shortcut?: string
  run: () => void
}

const THEME_ORDER: ThemeMode[] = ['light', 'dark', 'system']

export function useCommands(): Command[] {
  const navigate = useNavigate()
  const openDialog = useUIStore((s) => s.openDialog)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const toggleOutline = useUIStore((s) => s.toggleOutline)
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode)
  const openSearch = useUIStore((s) => s.openSearch)
  const settings = useSettingsStore((s) => s.settings)
  const setSettings = useSettingsStore((s) => s.set)
  const saveDocument = useTabsStore((s) => s.saveDocument)
  const deleteDocument = useWorkspaceStore((s) => s.deleteDocument)
  const duplicateDocument = useWorkspaceStore((s) => s.duplicateDocument)
  const doc = useActiveDocument()
  const [viewMode, setViewMode] = useViewMode(doc?.id)
  const { openFilePicker, openFolderPicker } = useFilePicker()

  return useMemo(() => {
    const commands: Command[] = [
      { id: 'new-document', label: 'New Document', group: 'File', icon: FilePlus, shortcut: '⌘N', run: () => openDialog({ type: 'newDocument' }) },
      { id: 'import-markdown', label: 'Import Markdown', group: 'File', icon: Upload, shortcut: '⌘O', run: () => openFilePicker() },
      { id: 'import-folder', label: 'Import Folder', group: 'File', icon: FolderInput, run: () => openFolderPicker() },
    ]

    if (doc) {
      commands.push(
        { id: 'save', label: 'Save', group: 'File', icon: Save, shortcut: '⌘S', run: () => saveDocument(doc.id, { snapshot: true }) },
        { id: 'rename', label: 'Rename', group: 'Document', icon: Pencil, run: () => dispatchEditorCommand(RENAME_ACTIVE_DOCUMENT_EVENT) },
        { id: 'duplicate', label: 'Duplicate', group: 'Document', icon: Copy, run: () => duplicateDocument(doc.id) },
        { id: 'move', label: 'Move To Folder', group: 'Document', icon: MoveIcon, run: () => openDialog({ type: 'moveDocument', documentId: doc.id }) },
        {
          id: 'delete',
          label: 'Delete',
          group: 'Document',
          icon: Trash2,
          run: async () => {
            const confirmed = await confirmDialog({ title: `Delete "${doc.name}"?`, message: 'It will be moved to Trash.', confirmLabel: 'Delete', danger: true })
            if (confirmed) deleteDocument(doc.id)
          },
        },
        { id: 'export-md', label: 'Export Markdown', group: 'Document', icon: FileDown, run: () => downloadMarkdown(doc) },
        { id: 'export-html', label: 'Export HTML', group: 'Document', icon: FileCode, run: () => downloadHtml(doc) },
        { id: 'print', label: 'Print', group: 'Document', icon: Printer, run: () => printDocument(doc) },
        { id: 'stats', label: 'Show Document Statistics', group: 'Document', icon: BarChart3, run: () => openDialog({ type: 'documentInfo', documentId: doc.id }) },
        { id: 'edit-mode', label: 'Toggle Edit Mode', group: 'View', icon: Edit3, run: () => setViewMode('edit') },
        { id: 'preview-mode', label: 'Toggle Preview', group: 'View', icon: Eye, run: () => setViewMode('preview') },
        { id: 'split-mode', label: 'Toggle Split View', group: 'View', icon: Columns2, shortcut: '⌘⇧E', run: () => setViewMode(viewMode === 'split' ? 'edit' : 'split') },
        { id: 'find', label: 'Find in Document', group: 'Edit', icon: SearchIcon, shortcut: '⌘F', run: () => dispatchEditorCommand(EDITOR_FIND_EVENT) },
        { id: 'replace', label: 'Replace', group: 'Edit', icon: Replace, shortcut: '⌘H', run: () => dispatchEditorCommand(EDITOR_REPLACE_EVENT) },
      )
    }

    commands.push(
      { id: 'toggle-sidebar', label: 'Toggle Sidebar', group: 'View', icon: PanelLeft, shortcut: '⌘\\', run: toggleSidebar },
      { id: 'toggle-outline', label: 'Toggle Outline', group: 'View', icon: PanelRight, run: toggleOutline },
      { id: 'focus-mode', label: 'Toggle Focus Mode', group: 'View', icon: Maximize2, shortcut: '⌘⇧F', run: toggleFocusMode },
      {
        id: 'toggle-theme',
        label: 'Toggle Theme',
        group: 'View',
        icon: Sun,
        run: () => {
          const idx = THEME_ORDER.indexOf(settings.theme)
          setSettings({ theme: THEME_ORDER[(idx + 1) % THEME_ORDER.length] })
        },
      },
      { id: 'focus-search', label: 'Focus Search', group: 'Navigate', icon: SearchIcon, shortcut: '⌘K', run: openSearch },
      { id: 'increase-font', label: 'Increase Font Size', group: 'Reading', icon: ZoomIn, shortcut: '⌘+', run: () => setSettings({ fontSize: Math.min(24, settings.fontSize + 1) }) },
      { id: 'decrease-font', label: 'Decrease Font Size', group: 'Reading', icon: ZoomOut, shortcut: '⌘-', run: () => setSettings({ fontSize: Math.max(12, settings.fontSize - 1) }) },
      {
        id: 'reset-reading',
        label: 'Reset Reading Settings',
        group: 'Reading',
        icon: RotateCcw,
        run: () => setSettings({ fontSize: 16, lineHeight: 'comfortable', contentWidth: 'comfortable', fontFamily: 'system' }),
      },
      { id: 'open-settings', label: 'Open Settings', group: 'App', icon: SettingsIcon, run: () => navigate('/settings') },
      { id: 'nav-trash', label: 'Open Trash', group: 'Navigate', icon: Trash2, run: () => navigate('/trash') },
    )

    return commands
  }, [
    doc,
    viewMode,
    settings,
    openDialog,
    openFilePicker,
    openFolderPicker,
    saveDocument,
    duplicateDocument,
    deleteDocument,
    setViewMode,
    toggleSidebar,
    toggleOutline,
    toggleFocusMode,
    setSettings,
    openSearch,
    navigate,
  ])
}
