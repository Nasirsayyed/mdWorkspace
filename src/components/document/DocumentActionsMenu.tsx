import { useNavigate } from 'react-router-dom'
import { FolderOpen, Edit3, Copy, FolderInput, Star, Pin, Link2, Download, FileCode, Printer, History, Trash2 } from 'lucide-react'
import { Menu, MenuItem, MenuSeparator } from '@/components/common/Menu'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useTabsStore } from '@/state/tabsStore'
import { useUIStore, confirmDialog } from '@/state/uiStore'
import { downloadMarkdown, downloadHtml, printDocument } from '@/services/export'
import { toast } from '@/state/toastStore'
import { RENAME_ACTIVE_DOCUMENT_EVENT, dispatchEditorCommand } from '@/utils/events'
import type { ID } from '@/types'

interface DocumentActionsMenuProps {
  documentId: ID
  x: number
  y: number
  onClose: () => void
}

export function DocumentActionsMenu({ documentId, x, y, onClose }: DocumentActionsMenuProps) {
  const navigate = useNavigate()
  const doc = useWorkspaceStore((s) => s.documents.find((d) => d.id === documentId))
  const toggleFavorite = useWorkspaceStore((s) => s.toggleFavorite)
  const togglePinned = useWorkspaceStore((s) => s.togglePinned)
  const duplicateDocument = useWorkspaceStore((s) => s.duplicateDocument)
  const deleteDocument = useWorkspaceStore((s) => s.deleteDocument)
  const openDocument = useTabsStore((s) => s.openDocument)
  const openDialog = useUIStore((s) => s.openDialog)

  if (!doc) return null

  const openDoc = async () => {
    await openDocument(documentId)
    navigate(`/document/${documentId}`)
  }

  return (
    <Menu x={x} y={y} onClose={onClose}>
      <MenuItem icon={<FolderOpen size={14} />} onSelect={() => { openDoc(); onClose() }}>Open</MenuItem>
      <MenuItem
        icon={<Edit3 size={14} />}
        onSelect={async () => {
          onClose()
          await openDoc()
          requestAnimationFrame(() => dispatchEditorCommand(RENAME_ACTIVE_DOCUMENT_EVENT))
        }}
      >
        Rename
      </MenuItem>
      <MenuItem icon={<Copy size={14} />} onSelect={async () => { const c = await duplicateDocument(documentId); onClose(); if (c) navigate(`/document/${c.id}`) }}>Duplicate</MenuItem>
      <MenuItem icon={<FolderInput size={14} />} onSelect={() => { openDialog({ type: 'moveDocument', documentId }); onClose() }}>Move To</MenuItem>
      <MenuSeparator />
      <MenuItem icon={<Star size={14} fill={doc.isFavorite ? 'currentColor' : 'none'} />} onSelect={() => { toggleFavorite(documentId); onClose() }}>
        {doc.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </MenuItem>
      <MenuItem icon={<Pin size={14} fill={doc.isPinned ? 'currentColor' : 'none'} />} onSelect={() => { togglePinned(documentId); onClose() }}>
        {doc.isPinned ? 'Unpin' : 'Pin'}
      </MenuItem>
      <MenuSeparator />
      <MenuItem
        icon={<Link2 size={14} />}
        onSelect={async () => {
          await navigator.clipboard.writeText(`${window.location.origin}/document/${documentId}`)
          toast.success('Link copied')
          onClose()
        }}
      >
        Copy Path
      </MenuItem>
      <MenuItem icon={<Download size={14} />} onSelect={() => { downloadMarkdown(doc); onClose() }}>Download</MenuItem>
      <MenuItem icon={<FileCode size={14} />} onSelect={() => { downloadHtml(doc); onClose() }}>Export HTML</MenuItem>
      <MenuItem icon={<Printer size={14} />} onSelect={() => { printDocument(doc); onClose() }}>Print</MenuItem>
      <MenuItem icon={<History size={14} />} onSelect={() => { openDialog({ type: 'versionHistory', documentId }); onClose() }}>Version History</MenuItem>
      <MenuSeparator />
      <MenuItem
        icon={<Trash2 size={14} />}
        danger
        onSelect={async () => {
          onClose()
          const confirmed = await confirmDialog({ title: `Delete "${doc.name}"?`, message: 'It will be moved to Trash and can be restored later.', confirmLabel: 'Delete', danger: true })
          if (confirmed) deleteDocument(documentId)
        }}
      >
        Delete
      </MenuItem>
    </Menu>
  )
}
