import { useState } from 'react'
import { DialogShell } from './DialogShell'
import { useUIStore, type DialogState } from '@/state/uiStore'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { FolderSelect } from '@/components/common/FolderSelect'

export function MoveDocumentDialog({ dialog }: { dialog: Extract<DialogState, { type: 'moveDocument' }> }) {
  const closeDialog = useUIStore((s) => s.closeDialog)
  const doc = useWorkspaceStore((s) => s.documents.find((d) => d.id === dialog.documentId))
  const moveDocument = useWorkspaceStore((s) => s.moveDocument)
  const [folderId, setFolderId] = useState<string | null>(doc?.folderId ?? null)

  if (!doc) return null

  return (
    <DialogShell
      title={`Move "${doc.name}"`}
      onClose={closeDialog}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={closeDialog}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              await moveDocument(doc.id, folderId)
              closeDialog()
            }}
          >
            Move
          </button>
        </>
      }
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          Destination folder
        </span>
        <FolderSelect value={folderId} onChange={setFolderId} />
      </label>
    </DialogShell>
  )
}
