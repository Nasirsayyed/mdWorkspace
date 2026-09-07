import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { LayoutGrid, List, Rows3, Star, Pin, Clock, FileText, Upload, Plus } from 'lucide-react'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useUIStore, type SortKey } from '@/state/uiStore'
import { useFilePicker } from '@/hooks/useFilePicker'
import { DocumentCard } from '@/components/document/DocumentCard'
import { DocumentListRow } from '@/components/document/DocumentListRow'
import { EmptyState } from '@/components/common/EmptyState'
import { byteSize } from '@/utils/text'
import { useIsMobile } from '@/hooks/useMediaQuery'
import clsx from 'clsx'
import type { MDDocument } from '@/types'

interface FileManagerPageProps {
  scope: 'all' | 'favorites' | 'pinned' | 'recent' | 'folder'
}

const TITLES: Record<FileManagerPageProps['scope'], string> = {
  all: 'All Documents',
  favorites: 'Favorites',
  pinned: 'Pinned',
  recent: 'Recently Opened',
  folder: 'Folder',
}
const ICONS = { all: FileText, favorites: Star, pinned: Pin, recent: Clock, folder: FileText }

function sortDocs(docs: MDDocument[], key: SortKey): MDDocument[] {
  const sorted = [...docs]
  switch (key) {
    case 'updated':
      return sorted.sort((a, b) => b.updatedAt - a.updatedAt)
    case 'created':
      return sorted.sort((a, b) => b.createdAt - a.createdAt)
    case 'nameAsc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'nameDesc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name))
    case 'sizeDesc':
      return sorted.sort((a, b) => byteSize(b.content) - byteSize(a.content))
    case 'sizeAsc':
      return sorted.sort((a, b) => byteSize(a.content) - byteSize(b.content))
    case 'readingTime':
      return sorted.sort((a, b) => b.readingTime - a.readingTime)
    case 'opened':
      return sorted.sort((a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0))
    default:
      return sorted
  }
}

export function FileManagerPage({ scope }: FileManagerPageProps) {
  const { id: folderId } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const tagFilter = searchParams.get('tag')
  const documents = useWorkspaceStore((s) => s.documents)
  const folders = useWorkspaceStore((s) => s.folders)
  const view = useUIStore((s) => s.fileManagerView)
  const setView = useUIStore((s) => s.setFileManagerView)
  const sortKey = useUIStore((s) => s.sortKey)
  const setSortKey = useUIStore((s) => s.setSortKey)
  const openDialog = useUIStore((s) => s.openDialog)
  const { openFilePicker } = useFilePicker()
  const [onlyFavoritesOfFolder, setOnlyFavoritesOfFolder] = useState(false)
  const isMobile = useIsMobile()
  const effectiveView = isMobile ? 'grid' : view

  const folder = scope === 'folder' && folderId ? folders.find((f) => f.id === folderId) : null

  const filtered = useMemo(() => {
    let list = documents
    if (scope === 'favorites') list = list.filter((d) => d.isFavorite)
    else if (scope === 'pinned') list = list.filter((d) => d.isPinned)
    else if (scope === 'recent') list = list.filter((d) => d.lastOpenedAt)
    else if (scope === 'folder') list = list.filter((d) => d.folderId === folderId)

    if (tagFilter) list = list.filter((d) => d.tags.includes(tagFilter))
    if (onlyFavoritesOfFolder) list = list.filter((d) => d.isFavorite)

    return sortDocs(list, sortKey)
  }, [documents, scope, folderId, tagFilter, sortKey, onlyFavoritesOfFolder])

  const Icon = ICONS[scope]
  const title = tagFilter ? `#${tagFilter}` : folder ? folder.name : TITLES[scope]

  return (
    <div style={{ padding: '24px 28px 60px' }}>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--accent)' }}>
            <Icon size={18} />
          </span>
          <h1 className="text-[19px] font-bold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h1>
          <span className="text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
            {filtered.length} {filtered.length === 1 ? 'document' : 'documents'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {tagFilter && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSearchParams({})}>
              Clear tag filter
            </button>
          )}
          <label className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={onlyFavoritesOfFolder} onChange={(e) => setOnlyFavoritesOfFolder(e.target.checked)} />
            Favorites only
          </label>
          <select className="input select btn-sm" style={{ width: 170 }} value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="updated">Recently Updated</option>
            <option value="opened">Recently Opened</option>
            <option value="created">Recently Created</option>
            <option value="nameAsc">Name A–Z</option>
            <option value="nameDesc">Name Z–A</option>
            <option value="sizeDesc">Largest</option>
            <option value="sizeAsc">Smallest</option>
            <option value="readingTime">Reading Time</option>
          </select>
          {!isMobile && (
            <div className="flex items-center gap-0.5" style={{ background: 'var(--bg-sunken)', borderRadius: 8, padding: 3 }}>
              <button type="button" className={clsx('btn-icon', view === 'grid' ? 'btn-primary' : 'btn-ghost')} style={{ width: 26, height: 26 }} onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}>
                <LayoutGrid size={13} />
              </button>
              <button type="button" className={clsx('btn-icon', view === 'list' ? 'btn-primary' : 'btn-ghost')} style={{ width: 26, height: 26 }} onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'}>
                <List size={13} />
              </button>
              <button type="button" className={clsx('btn-icon', view === 'compact' ? 'btn-primary' : 'btn-ghost')} style={{ width: 26, height: 26 }} onClick={() => setView('compact')} aria-label="Compact view" aria-pressed={view === 'compact'}>
                <Rows3 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Icon size={20} />}
          title={`No documents ${scope === 'all' ? 'yet' : 'here'}`}
          description={scope === 'favorites' ? 'Star documents to find them quickly here.' : scope === 'pinned' ? 'Pin important documents to keep them close.' : 'Import a Markdown file or create a new document to get started.'}
          actions={
            scope === 'all' && (
              <>
                <button type="button" className="btn btn-primary" onClick={() => openFilePicker(folder?.id ?? null)}>
                  <Upload size={14} /> Import Markdown
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => openDialog({ type: 'newDocument', folderId: folder?.id ?? null })}>
                  <Plus size={14} /> New Document
                </button>
              </>
            )
          }
        />
      ) : effectiveView === 'grid' ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <div className="panel" style={{ overflow: 'hidden' }}>
          {effectiveView === 'list' && (
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide" style={{ padding: '8px 12px', color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ width: 14 }} />
              <span style={{ flex: '1 1 220px' }}>Name</span>
              <span style={{ flex: '0 0 140px' }}>Folder</span>
              <span style={{ flex: '0 0 110px' }}>Updated</span>
              <span style={{ flex: '0 0 70px' }}>Size</span>
              <span style={{ width: 26 }} />
              <span style={{ width: 12 }} />
              <span style={{ width: 26 }} />
            </div>
          )}
          {filtered.map((doc) => (
            <DocumentListRow key={doc.id} doc={doc} compact={effectiveView === 'compact'} />
          ))}
        </div>
      )}
    </div>
  )
}
