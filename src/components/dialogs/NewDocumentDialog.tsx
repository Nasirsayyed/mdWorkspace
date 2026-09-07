import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DialogShell } from './DialogShell'
import { useUIStore, type DialogState } from '@/state/uiStore'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useTabsStore } from '@/state/tabsStore'
import { documentTemplates } from '@/data/templates'
import { ensureMdExtension } from '@/utils/text'
import { FolderSelect } from '@/components/common/FolderSelect'

export function NewDocumentDialog({ dialog }: { dialog: Extract<DialogState, { type: 'newDocument' }> }) {
  const closeDialog = useUIStore((s) => s.closeDialog)
  const createDocument = useWorkspaceStore((s) => s.createDocument)
  const openDocument = useTabsStore((s) => s.openDocument)
  const navigate = useNavigate()

  const [title, setTitle] = useState('Untitled Document')
  const [folderId, setFolderId] = useState<string | null>(dialog.folderId ?? null)
  const [templateId, setTemplateId] = useState('blank')

  const handleCreate = async () => {
    const name = ensureMdExtension(title.trim() || 'Untitled Document')
    const template = documentTemplates.find((t) => t.id === templateId) ?? documentTemplates[0]
    const content = template.content(title.trim() || 'Untitled Document')
    try {
      const doc = await createDocument({ name, content, folderId })
      await openDocument(doc.id)
      closeDialog()
      navigate(`/document/${doc.id}`)
    } catch {
      // createDocument already surfaced a toast; keep the dialog open so the user can retry.
    }
  }

  return (
    <DialogShell
      title="New Markdown Document"
      onClose={closeDialog}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={closeDialog}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleCreate}>
            Create
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Title
          </span>
          <input
            className="input"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Untitled Document"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Folder
          </span>
          <FolderSelect value={folderId} onChange={setFolderId} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Template
          </span>
          <select className="input select" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            {documentTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </DialogShell>
  )
}
