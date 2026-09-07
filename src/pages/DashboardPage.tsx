import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { FileText, FolderClosed, Clock3, Plus, Upload, FolderInput, Search, ArrowRight } from 'lucide-react'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useTabsStore } from '@/state/tabsStore'
import { useUIStore } from '@/state/uiStore'
import { useFilePicker } from '@/hooks/useFilePicker'
import { DocumentCard } from '@/components/document/DocumentCard'
import { EmptyState } from '@/components/common/EmptyState'
import { formatRelativeTime, excerpt } from '@/utils/text'

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardPage() {
  const navigate = useNavigate()
  const documents = useWorkspaceStore((s) => s.documents)
  const folders = useWorkspaceStore((s) => s.folders)
  const openDocument = useTabsStore((s) => s.openDocument)
  const openDialog = useUIStore((s) => s.openDialog)
  const openSearch = useUIStore((s) => s.openSearch)
  const { openFilePicker, openFolderPicker } = useFilePicker()

  const continueReading = useMemo(
    () =>
      [...documents]
        .filter((d) => (d.readingProgress ?? 0) > 0.02 && (d.readingProgress ?? 0) < 0.98)
        .sort((a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0))
        .slice(0, 3),
    [documents],
  )
  const recent = useMemo(
    () => [...documents].filter((d) => d.lastOpenedAt).sort((a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0)).slice(0, 6),
    [documents],
  )
  const favorites = useMemo(() => documents.filter((d) => d.isFavorite).slice(0, 6), [documents])
  const recentlyAdded = useMemo(() => [...documents].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6), [documents])
  const lastReadingTime = continueReading[0]?.readingTime ?? recent[0]?.readingTime

  const openDoc = async (id: string) => {
    await openDocument(id)
    navigate(`/document/${id}`)
  }

  if (documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={<FileText size={22} />}
          title="No documents yet"
          description="Your Markdown workspace is empty. Import your first Markdown file or create a new document."
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={() => openFilePicker()}>
                <Upload size={14} /> Import Markdown
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => openDialog({ type: 'newDocument' })}>
                <Plus size={14} /> Create Document
              </button>
            </>
          }
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 28px 60px' }}>
      <h1 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
        {greeting()}
      </h1>
      <p className="text-[13.5px] mb-6" style={{ color: 'var(--text-secondary)' }}>
        Your documentation workspace
      </p>

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: 32 }}>
        <StatCard icon={<FileText size={16} />} value={documents.length} label="Documents" />
        <StatCard icon={<FolderClosed size={16} />} value={folders.length} label="Folders" />
        <StatCard icon={<Clock3 size={16} />} value={lastReadingTime ? `${lastReadingTime} min` : '—'} label="Last Reading" />
      </div>

      <div className="flex gap-2 flex-wrap mb-10">
        <button type="button" className="btn btn-primary" onClick={() => openDialog({ type: 'newDocument' })}>
          <Plus size={14} /> New Document
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => openFilePicker()}>
          <Upload size={14} /> Import Markdown
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => openFolderPicker()}>
          <FolderInput size={14} /> Import Folder
        </button>
        <button type="button" className="btn btn-secondary" onClick={openSearch}>
          <Search size={14} /> Search
        </button>
      </div>

      {continueReading.length > 0 && (
        <Section title="Continue Reading">
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {continueReading.map((doc) => (
              <button
                type="button"
                key={doc.id}
                onClick={() => openDoc(doc.id)}
                className="panel flex flex-col gap-2 text-left"
                style={{ padding: 16 }}
              >
                <span className="text-[13.5px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {doc.name}
                </span>
                <span className="text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
                  Last opened {formatRelativeTime(doc.lastOpenedAt)}
                </span>
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {excerpt(doc.content, 90)}
                </p>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.round((doc.readingProgress ?? 0) * 100)}%` }} />
                </div>
                <span className="flex items-center gap-1 text-[12px] font-medium" style={{ color: 'var(--accent)' }}>
                  Continue <ArrowRight size={12} />
                </span>
              </button>
            ))}
          </div>
        </Section>
      )}

      {recent.length > 0 && (
        <Section title="Recently Opened" onSeeAll={() => navigate('/recent')}>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {recent.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} compact />
            ))}
          </div>
        </Section>
      )}

      {favorites.length > 0 && (
        <Section title="Favorites" onSeeAll={() => navigate('/favorites')}>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {favorites.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} compact />
            ))}
          </div>
        </Section>
      )}

      <Section title="Recently Added" onSeeAll={() => navigate('/documents')}>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {recentlyAdded.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} compact />
          ))}
        </div>
      </Section>
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="panel flex flex-col gap-2" style={{ padding: 16 }}>
      <span style={{ color: 'var(--accent)' }}>{icon}</span>
      <span className="text-[22px] font-bold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
      <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </span>
    </div>
  )
}

function Section({ title, children, onSeeAll }: { title: string; children: React.ReactNode; onSeeAll?: () => void }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {onSeeAll && (
          <button type="button" onClick={onSeeAll} className="text-[12px] font-medium" style={{ color: 'var(--accent)' }}>
            See all
          </button>
        )}
      </div>
      {children}
    </section>
  )
}
