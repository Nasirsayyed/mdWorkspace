import { useState } from 'react'
import { DialogShell } from './DialogShell'
import { useUIStore, type DialogState } from '@/state/uiStore'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { computeDocumentStats } from '@/utils/text'
import { formatDate, formatBytes, byteSize } from '@/utils/text'
import { X } from 'lucide-react'

export function DocumentInfoDialog({ dialog }: { dialog: Extract<DialogState, { type: 'documentInfo' }> }) {
  const closeDialog = useUIStore((s) => s.closeDialog)
  const doc = useWorkspaceStore((s) => s.documents.find((d) => d.id === dialog.documentId))
  const folders = useWorkspaceStore((s) => s.folders)
  const updateDocument = useWorkspaceStore((s) => s.updateDocument)
  const [tagInput, setTagInput] = useState('')

  if (!doc) return null

  const stats = computeDocumentStats(doc.content)
  const folderName = doc.folderId ? (folders.find((f) => f.id === doc.folderId)?.name ?? '—') : 'All Documents'

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '')
    if (!tag || doc.tags.includes(tag)) return
    updateDocument(doc.id, { tags: [...doc.tags, tag] }, { touch: false })
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    updateDocument(doc.id, { tags: doc.tags.filter((t) => t !== tag) }, { touch: false })
  }

  const rows: [string, string][] = [
    ['Folder', folderName],
    ['Created', formatDate(doc.createdAt)],
    ['Updated', formatDate(doc.updatedAt)],
    ['Words', stats.words.toLocaleString()],
    ['Characters', stats.characters.toLocaleString()],
    ['Lines', stats.lines.toLocaleString()],
    ['Reading Time', `${stats.readingTime} min`],
    ['Size', formatBytes(byteSize(doc.content))],
  ]

  return (
    <DialogShell title={doc.name} onClose={closeDialog} width={420}>
      <div className="flex flex-col gap-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between" style={{ padding: '7px 2px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
              {label}
            </span>
            <span className="text-[12.5px] font-medium" style={{ color: 'var(--text-primary)' }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          Tags
        </span>
        <div className="flex flex-wrap gap-1.5">
          {doc.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-[11.5px] rounded-full"
              style={{ background: 'var(--bg-sunken)', padding: '3px 8px 3px 10px', color: 'var(--text-secondary)' }}
            >
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`} style={{ display: 'flex' }}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Add a tag…"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={addTag}>
            Add
          </button>
        </div>
      </div>
    </DialogShell>
  )
}
