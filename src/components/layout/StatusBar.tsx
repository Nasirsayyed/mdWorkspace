import { useActiveDocument } from '@/hooks/useActiveDocument'
import { useTabsStore } from '@/state/tabsStore'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { computeDocumentStats } from '@/utils/text'
import { formatRelativeTime } from '@/utils/text'

export function StatusBar() {
  const doc = useActiveDocument()
  const drafts = useTabsStore((s) => s.drafts)
  const saveStatus = useTabsStore((s) => s.saveStatus)
  const documents = useWorkspaceStore((s) => s.documents)
  const folders = useWorkspaceStore((s) => s.folders)

  if (!doc) {
    return (
      <div className="statusbar">
        <span>{documents.length} documents</span>
        <span>{folders.length} folders</span>
        <span className="ml-auto">Local-first — nothing leaves your browser</span>
      </div>
    )
  }

  const content = drafts[doc.id] ?? doc.content
  const stats = computeDocumentStats(content)
  const status = saveStatus[doc.id]

  return (
    <div className="statusbar">
      <span>Words: {stats.words.toLocaleString()}</span>
      <span>Characters: {stats.characters.toLocaleString()}</span>
      <span>Reading: {stats.readingTime} min</span>
      <span className="ml-auto">
        {status === 'saving' ? 'Saving…' : status === 'unsaved' ? 'Unsaved changes' : `Updated ${formatRelativeTime(doc.updatedAt)}`}
      </span>
    </div>
  )
}
