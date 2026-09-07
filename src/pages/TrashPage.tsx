import { Trash2, RotateCcw, XCircle } from 'lucide-react'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { confirmDialog } from '@/state/uiStore'
import { EmptyState } from '@/components/common/EmptyState'
import { formatRelativeTime } from '@/utils/text'

export function TrashPage() {
  const trashItems = useWorkspaceStore((s) => s.trashItems)
  const restoreDocument = useWorkspaceStore((s) => s.restoreDocument)
  const permanentlyDelete = useWorkspaceStore((s) => s.permanentlyDelete)
  const emptyTrash = useWorkspaceStore((s) => s.emptyTrash)

  return (
    <div style={{ padding: '24px 28px 60px' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Trash2 size={18} color="var(--text-tertiary)" />
          <h1 className="text-[19px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Trash
          </h1>
          <span className="text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
            {trashItems.length} {trashItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        {trashItems.length > 0 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={async () => {
              const confirmed = await confirmDialog({
                title: 'Empty Trash?',
                message: `This permanently deletes ${trashItems.length} document${trashItems.length === 1 ? '' : 's'}. This cannot be undone.`,
                confirmLabel: 'Empty Trash',
                danger: true,
              })
              if (confirmed) emptyTrash()
            }}
          >
            Empty Trash
          </button>
        )}
      </div>

      {trashItems.length === 0 ? (
        <EmptyState icon={<Trash2 size={20} />} title="Trash is empty" description="Deleted documents appear here and can be restored any time before you empty the trash." />
      ) : (
        <div className="panel" style={{ overflow: 'hidden' }}>
          {trashItems.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3" style={{ padding: '11px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.name}
                </span>
                <span className="text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
                  Deleted {formatRelativeTime(doc.deletedAt)}
                </span>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => restoreDocument(doc.id)}>
                <RotateCcw size={12} /> Restore
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--danger)' }}
                onClick={async () => {
                  const confirmed = await confirmDialog({
                    title: `Permanently delete "${doc.name}"?`,
                    message: 'This cannot be undone.',
                    confirmLabel: 'Delete Permanently',
                    danger: true,
                  })
                  if (confirmed) permanentlyDelete(doc.id)
                }}
              >
                <XCircle size={12} /> Delete Permanently
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
