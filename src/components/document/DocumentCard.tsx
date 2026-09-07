import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Pin } from 'lucide-react'
import type { MDDocument } from '@/types'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useTabsStore } from '@/state/tabsStore'
import { excerpt, formatRelativeTime } from '@/utils/text'
import { DocumentActionsMenu } from './DocumentActionsMenu'

export function DocumentCard({ doc, compact }: { doc: MDDocument; compact?: boolean }) {
  const navigate = useNavigate()
  const openDocument = useTabsStore((s) => s.openDocument)
  const folders = useWorkspaceStore((s) => s.folders)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)

  const folderName = doc.folderId ? folders.find((f) => f.id === doc.folderId)?.name : null

  const open = async () => {
    await openDocument(doc.id)
    navigate(`/document/${doc.id}`)
  }

  return (
    <div
      className="panel flex flex-col gap-2 cursor-pointer"
      style={{ padding: compact ? 12 : 16, transition: 'border-color 120ms, box-shadow 120ms' }}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('application/x-document-id', doc.id)}
      onClick={open}
      onContextMenu={(e) => {
        e.preventDefault()
        setMenuPos({ x: e.clientX, y: e.clientY })
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13.5px] font-semibold" style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {doc.name}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          {doc.isPinned && <Pin size={12} color="var(--accent)" fill="var(--accent)" />}
          {doc.isFavorite && <Star size={12} color="var(--accent)" fill="var(--accent)" />}
        </div>
      </div>
      {folderName && (
        <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          {folderName}
        </span>
      )}
      {!compact && (
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {excerpt(doc.content, 110)}
        </p>
      )}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex gap-1 flex-wrap">
          {doc.tags.slice(0, 2).map((t) => (
            <span key={t} className="text-[10.5px] rounded-full" style={{ background: 'var(--bg-sunken)', padding: '2px 7px', color: 'var(--text-tertiary)' }}>
              #{t}
            </span>
          ))}
        </div>
        <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          {formatRelativeTime(doc.updatedAt)}
        </span>
      </div>

      {menuPos && <DocumentActionsMenu documentId={doc.id} x={menuPos.x} y={menuPos.y} onClose={() => setMenuPos(null)} />}
    </div>
  )
}
