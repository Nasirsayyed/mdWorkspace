import { useEffect, useRef, useState } from 'react'
import { Star, Pin, MoreHorizontal, Edit3, Columns2, Eye } from 'lucide-react'
import clsx from 'clsx'
import type { MDDocument, EditorMode } from '@/types'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { Breadcrumbs } from './Breadcrumbs'
import { DocumentActionsMenu } from './DocumentActionsMenu'
import { formatRelativeTime } from '@/utils/text'
import { RENAME_ACTIVE_DOCUMENT_EVENT } from '@/utils/events'

interface DocumentHeaderProps {
  doc: MDDocument
  viewMode: EditorMode
  onViewModeChange: (mode: EditorMode) => void
}

const MODES: { id: EditorMode; label: string; icon: typeof Edit3 }[] = [
  { id: 'edit', label: 'Edit', icon: Edit3 },
  { id: 'split', label: 'Split', icon: Columns2 },
  { id: 'preview', label: 'Preview', icon: Eye },
]

export function DocumentHeader({ doc, viewMode, onViewModeChange }: DocumentHeaderProps) {
  const renameDocument = useWorkspaceStore((s) => s.renameDocument)
  const toggleFavorite = useWorkspaceStore((s) => s.toggleFavorite)
  const togglePinned = useWorkspaceStore((s) => s.togglePinned)

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(doc.name)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (editingTitle) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editingTitle])

  useEffect(() => {
    function onRenameRequest() {
      setTitleDraft(doc.name)
      setEditingTitle(true)
    }
    window.addEventListener(RENAME_ACTIVE_DOCUMENT_EVENT, onRenameRequest)
    return () => window.removeEventListener(RENAME_ACTIVE_DOCUMENT_EVENT, onRenameRequest)
  }, [doc.name])

  const commitRename = () => {
    setEditingTitle(false)
    const trimmed = titleDraft.trim()
    if (trimmed && trimmed !== doc.name) renameDocument(doc.id, trimmed)
  }

  return (
    <div style={{ padding: '14px 24px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <Breadcrumbs folderId={doc.folderId} current={doc.name} />

      <div className="flex items-center gap-2 flex-wrap" style={{ margin: '6px 0 12px' }}>
        {editingTitle ? (
          <input
            ref={inputRef}
            className="input"
            style={{ fontSize: 21, fontWeight: 650, height: 36, maxWidth: 480 }}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') {
                setTitleDraft(doc.name)
                setEditingTitle(false)
              }
            }}
          />
        ) : (
          <h1
            className="text-[21px] font-bold cursor-text"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => {
              setTitleDraft(doc.name)
              setEditingTitle(true)
            }}
            title="Click to rename"
          >
            {doc.name}
          </h1>
        )}

        <button type="button" className="btn-icon btn-ghost" onClick={() => toggleFavorite(doc.id)} aria-label="Toggle favorite" aria-pressed={doc.isFavorite}>
          <Star size={16} fill={doc.isFavorite ? 'var(--accent)' : 'none'} color={doc.isFavorite ? 'var(--accent)' : 'currentColor'} />
        </button>
        <button type="button" className="btn-icon btn-ghost" onClick={() => togglePinned(doc.id)} aria-label="Toggle pinned" aria-pressed={doc.isPinned}>
          <Pin size={16} fill={doc.isPinned ? 'var(--accent)' : 'none'} color={doc.isPinned ? 'var(--accent)' : 'currentColor'} />
        </button>
        <button
          type="button"
          ref={menuBtnRef}
          className="btn-icon btn-ghost"
          aria-label="Document actions"
          onClick={() => {
            const rect = menuBtnRef.current?.getBoundingClientRect()
            setMenuPos(rect ? { x: rect.left, y: rect.bottom + 6 } : { x: 0, y: 0 })
          }}
        >
          <MoreHorizontal size={16} />
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-0.5" style={{ background: 'var(--bg-sunken)', borderRadius: 8, padding: 3 }} role="tablist" aria-label="View mode">
            {MODES.map((m) => (
              <button
                type="button"
                key={m.id}
                role="tab"
                aria-selected={viewMode === m.id}
                className={clsx('btn btn-sm', viewMode === m.id ? 'btn-primary' : 'btn-ghost')}
                style={{ height: 26 }}
                onClick={() => onViewModeChange(m.id)}
              >
                <m.icon size={13} />
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11.5px] pb-2" style={{ color: 'var(--text-tertiary)', marginTop: -6 }}>
        Last edited {formatRelativeTime(doc.updatedAt)}
      </p>

      {menuPos && <DocumentActionsMenu documentId={doc.id} x={menuPos.x} y={menuPos.y} onClose={() => setMenuPos(null)} />}
    </div>
  )
}
