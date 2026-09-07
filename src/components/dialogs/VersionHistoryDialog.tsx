import { useEffect, useState } from 'react'
import { DialogShell } from './DialogShell'
import { useUIStore, type DialogState, confirmDialog } from '@/state/uiStore'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useTabsStore } from '@/state/tabsStore'
import { listVersions } from '@/storage/versions'
import type { DocumentVersion } from '@/types'
import { formatDate, formatDateTime } from '@/utils/text'
import { diffLines } from '@/utils/diff'
import { toast } from '@/state/toastStore'

function groupByDay(versions: DocumentVersion[]): [string, DocumentVersion[]][] {
  const groups = new Map<string, DocumentVersion[]>()
  for (const v of versions) {
    const key = formatDate(v.createdAt)
    const list = groups.get(key) ?? []
    list.push(v)
    groups.set(key, list)
  }
  return Array.from(groups.entries())
}

export function VersionHistoryDialog({ dialog }: { dialog: Extract<DialogState, { type: 'versionHistory' }> }) {
  const closeDialog = useUIStore((s) => s.closeDialog)
  const doc = useWorkspaceStore((s) => s.documents.find((d) => d.id === dialog.documentId))
  const updateDocument = useWorkspaceStore((s) => s.updateDocument)
  const discardDraft = useTabsStore((s) => s.discardDraft)

  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [selected, setSelected] = useState<DocumentVersion | null>(null)
  const [mode, setMode] = useState<'view' | 'compare'>('view')

  useEffect(() => {
    if (!doc) return
    listVersions(doc.id).then(setVersions)
  }, [doc])

  if (!doc) return null

  const handleRestore = async (version: DocumentVersion) => {
    const confirmed = await confirmDialog({
      title: 'Restore this version?',
      message: `This replaces the current content of "${doc.name}" with the version from ${formatDateTime(version.createdAt)}. Your current content will be saved to history first.`,
      confirmLabel: 'Restore',
    })
    if (!confirmed) return
    await updateDocument(doc.id, { content: version.content }, { snapshot: true })
    discardDraft(doc.id)
    toast.success('Version restored')
    closeDialog()
  }

  return (
    <DialogShell title={`Version History — ${doc.name}`} onClose={closeDialog} width={640}>
      <div className="flex gap-4" style={{ minHeight: 360 }}>
        <div className="flex flex-col gap-3" style={{ width: 200, flexShrink: 0, overflowY: 'auto', maxHeight: 420 }}>
          {versions.length === 0 && (
            <p className="text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
              No earlier versions yet. Versions are saved automatically as you edit.
            </p>
          )}
          {groupByDay(versions).map(([day, group]) => (
            <div key={day}>
              <div className="text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                {day}
              </div>
              <div className="flex flex-col gap-0.5">
                {group.map((v) => (
                  <button
                    type="button"
                    key={v.id}
                    onClick={() => setSelected(v)}
                    className="text-left text-[12.5px] rounded-md px-2 py-1.5"
                    style={{
                      background: selected?.id === v.id ? 'var(--bg-selected)' : 'transparent',
                      color: selected?.id === v.id ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    {formatDateTime(v.createdAt)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {!selected ? (
            <p className="text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
              Select a version to view or compare.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button type="button" className={`btn btn-sm ${mode === 'view' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setMode('view')}>
                  View
                </button>
                <button type="button" className={`btn btn-sm ${mode === 'compare' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setMode('compare')}>
                  Compare
                </button>
                <button type="button" className="btn btn-sm btn-primary" style={{ marginLeft: 'auto' }} onClick={() => handleRestore(selected)}>
                  Restore
                </button>
              </div>
              <div
                className="flex-1 overflow-auto"
                style={{ background: 'var(--bg-sunken)', borderRadius: 8, padding: 12, fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'pre-wrap' }}
              >
                {mode === 'view'
                  ? selected.content || '(empty document)'
                  : diffLines(selected.content, doc.content).map((op, i) => (
                      <div
                        key={i}
                        style={{
                          background: op.type === 'add' ? 'rgba(22,163,74,0.15)' : op.type === 'remove' ? 'rgba(220,38,38,0.15)' : 'transparent',
                          color: op.type === 'equal' ? 'var(--text-secondary)' : 'var(--text-primary)',
                        }}
                      >
                        {op.type === 'add' ? '+ ' : op.type === 'remove' ? '- ' : '  '}
                        {op.line || ' '}
                      </div>
                    ))}
              </div>
            </>
          )}
        </div>
      </div>
    </DialogShell>
  )
}
