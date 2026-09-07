import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useWorkspaceStore } from '@/state/workspaceStore'
import type { ID } from '@/types'

export function Breadcrumbs({ folderId, current }: { folderId: ID | null; current: string }) {
  const navigate = useNavigate()
  const folders = useWorkspaceStore((s) => s.folders)

  const chain: { id: ID; name: string }[] = []
  let cursor = folderId
  while (cursor) {
    const folder = folders.find((f) => f.id === cursor)
    if (!folder) break
    chain.unshift({ id: folder.id, name: folder.name })
    cursor = folder.parentId
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 flex-wrap text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
      <button type="button" onClick={() => navigate('/documents')} className="hover:underline" style={{ color: 'var(--text-tertiary)' }}>
        Workspace
      </button>
      {chain.map((f) => (
        <span key={f.id} className="flex items-center gap-1">
          <ChevronRight size={11} />
          <button type="button" onClick={() => navigate(`/folder/${f.id}`)} className="hover:underline" style={{ color: 'var(--text-tertiary)' }}>
            {f.name}
          </button>
        </span>
      ))}
      <ChevronRight size={11} />
      <span style={{ color: 'var(--text-secondary)' }}>{current}</span>
    </nav>
  )
}
