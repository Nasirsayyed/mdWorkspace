import { NavLink, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { Home, FileText, Star, Pin, Clock, Trash2, FolderPlus, Hash } from 'lucide-react'
import clsx from 'clsx'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useUIStore } from '@/state/uiStore'
import { useSettingsStore } from '@/state/settingsStore'
import { FolderTree } from './FolderTree'

function useTagCounts() {
  const documents = useWorkspaceStore((s) => s.documents)
  const counts = new Map<string, number>()
  for (const doc of documents) {
    for (const tag of doc.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)
}

export function SidebarContent() {
  const navigate = useNavigate()
  const documents = useWorkspaceStore((s) => s.documents)
  const trashItems = useWorkspaceStore((s) => s.trashItems)
  const openDialog = useUIStore((s) => s.openDialog)
  const tagCounts = useTagCounts()

  const counts = {
    all: documents.length,
    favorites: documents.filter((d) => d.isFavorite).length,
    pinned: documents.filter((d) => d.isPinned).length,
    recent: documents.filter((d) => d.lastOpenedAt).length,
    trash: trashItems.length,
  }

  const navClass = ({ isActive }: { isActive: boolean }) => clsx('nav-item', isActive && 'active')

  return (
    <div className="sidebar-scroll">
      <nav aria-label="Workspace">
        <NavLink to="/" end className={navClass}>
          <span className="nav-icon"><Home size={15} /></span>
          <span className="nav-label">Home</span>
        </NavLink>
        <NavLink to="/documents" className={navClass}>
          <span className="nav-icon"><FileText size={15} /></span>
          <span className="nav-label">All Documents</span>
          <span className="nav-count">{counts.all}</span>
        </NavLink>
        <NavLink to="/favorites" className={navClass}>
          <span className="nav-icon"><Star size={15} /></span>
          <span className="nav-label">Favorites</span>
          <span className="nav-count">{counts.favorites}</span>
        </NavLink>
        <NavLink to="/pinned" className={navClass}>
          <span className="nav-icon"><Pin size={15} /></span>
          <span className="nav-label">Pinned</span>
          <span className="nav-count">{counts.pinned}</span>
        </NavLink>
        <NavLink to="/recent" className={navClass}>
          <span className="nav-icon"><Clock size={15} /></span>
          <span className="nav-label">Recently Opened</span>
          <span className="nav-count">{counts.recent}</span>
        </NavLink>
        <NavLink to="/trash" className={navClass}>
          <span className="nav-icon"><Trash2 size={15} /></span>
          <span className="nav-label">Trash</span>
          {counts.trash > 0 && <span className="nav-count">{counts.trash}</span>}
        </NavLink>
      </nav>

      <div className="flex items-center justify-between" style={{ paddingRight: 6 }}>
        <div className="sidebar-section-label" style={{ paddingTop: 14 }}>
          Folders
        </div>
        <button
          type="button"
          className="btn-icon btn-ghost"
          style={{ width: 24, height: 24 }}
          onClick={() => openDialog({ type: 'newFolder', parentId: null })}
          aria-label="New folder"
          title="New folder"
        >
          <FolderPlus size={14} />
        </button>
      </div>
      <FolderTree />

      {tagCounts.length > 0 && (
        <>
          <div className="sidebar-section-label">Tags</div>
          {tagCounts.map(([tag, count]) => (
            <button
              type="button"
              key={tag}
              className="nav-item"
              style={{ width: '100%' }}
              onClick={() => navigate(`/documents?tag=${encodeURIComponent(tag)}`)}
            >
              <span className="nav-icon"><Hash size={13} /></span>
              <span className="nav-label">{tag}</span>
              <span className="nav-count">{count}</span>
            </button>
          ))}
        </>
      )}
    </div>
  )
}

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const settings = useSettingsStore((s) => s.settings)
  const setSettings = useSettingsStore((s) => s.set)
  const [width, setWidth] = useState(settings.sidebarWidth)
  const resizing = useRef(false)

  const onResizeStart = () => {
    resizing.current = true
    const onMove = (e: MouseEvent) => {
      if (!resizing.current) return
      setWidth(Math.min(400, Math.max(200, e.clientX)))
    }
    const onUp = () => {
      resizing.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      setSettings({ sidebarWidth: width })
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div className="flex">
      <aside className={clsx('sidebar', !sidebarOpen && 'collapsed')} style={{ ['--sidebar-w' as string]: `${width}px` }} aria-label="Sidebar">
        <SidebarContent />
      </aside>
      {sidebarOpen && <div className="resize-handle" onMouseDown={onResizeStart} role="separator" aria-orientation="vertical" aria-label="Resize sidebar" />}
    </div>
  )
}
