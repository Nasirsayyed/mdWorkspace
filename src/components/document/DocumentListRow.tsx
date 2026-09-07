import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Star, Pin, MoreHorizontal } from 'lucide-react'
import type { MDDocument } from '@/types'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useTabsStore } from '@/state/tabsStore'
import { formatRelativeTime, formatBytes, byteSize } from '@/utils/text'
import { DocumentActionsMenu } from './DocumentActionsMenu'

export function DocumentListRow({ doc, compact }: { doc: MDDocument; compact?: boolean }) {
  const navigate = useNavigate()
  const openDocument = useTabsStore((s) => s.openDocument)
  const folders = useWorkspaceStore((s) => s.folders)
  const toggleFavorite = useWorkspaceStore((s) => s.toggleFavorite)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  const folderName = doc.folderId ? (folders.find((f) => f.id === doc.folderId)?.name ?? '—') : 'All Documents'

  const open = async () => {
    await openDocument(doc.id)
    navigate(`/document/${doc.id}`)
  }

  return (
    <div
      className="flex items-center gap-3 cursor-pointer"
      style={{ padding: compact ? '5px 10px' : '9px 12px', borderBottom: '1px solid var(--border-subtle)', height: compact ? 34 : 'auto' }}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('application/x-document-id', doc.id)}
      onClick={open}
      onContextMenu={(e) => {
        e.preventDefault()
        setMenuPos({ x: e.clientX, y: e.clientY })
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <FileText size={14} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
      <span className="text-[12.8px] font-medium" style={{ color: 'var(--text-primary)', flex: '1 1 220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {doc.name}
      </span>
      {!compact && (
        <span className="text-[12px]" style={{ color: 'var(--text-tertiary)', flex: '0 0 140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {folderName}
        </span>
      )}
      {!compact && (
        <span className="text-[12px]" style={{ color: 'var(--text-tertiary)', flex: '0 0 110px' }}>
          {formatRelativeTime(doc.updatedAt)}
        </span>
      )}
      {!compact && (
        <span className="text-[12px]" style={{ color: 'var(--text-tertiary)', flex: '0 0 70px' }}>
          {formatBytes(byteSize(doc.content))}
        </span>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          toggleFavorite(doc.id)
        }}
        className="btn-icon btn-ghost"
        style={{ width: 26, height: 26 }}
        aria-label="Toggle favorite"
      >
        <Star size={13} fill={doc.isFavorite ? 'var(--accent)' : 'none'} color={doc.isFavorite ? 'var(--accent)' : 'currentColor'} />
      </button>
      {doc.isPinned && <Pin size={12} color="var(--accent)" fill="var(--accent)" />}
      <button
        type="button"
        ref={btnRef}
        className="btn-icon btn-ghost"
        style={{ width: 26, height: 26 }}
        aria-label="Document actions"
        onClick={(e) => {
          e.stopPropagation()
          const rect = btnRef.current?.getBoundingClientRect()
          setMenuPos(rect ? { x: rect.left - 170, y: rect.bottom + 4 } : { x: e.clientX, y: e.clientY })
        }}
      >
        <MoreHorizontal size={14} />
      </button>

      {menuPos && <DocumentActionsMenu documentId={doc.id} x={menuPos.x} y={menuPos.y} onClose={() => setMenuPos(null)} />}
    </div>
  )
}
