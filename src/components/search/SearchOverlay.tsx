import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Clock, Zap } from 'lucide-react'
import { useUIStore } from '@/state/uiStore'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useTabsStore } from '@/state/tabsStore'
import { useCommands } from '@/hooks/useCommands'
import { buildSearchIndex, search } from '@/services/search'
import { Portal } from '@/components/common/Portal'
import { highlightMatches } from '@/utils/text'
import { useDebounce } from '@/hooks/useDebounce'

export function SearchOverlay() {
  const open = useUIStore((s) => s.searchOpen)
  const close = useUIStore((s) => s.closeSearch)
  const documents = useWorkspaceStore((s) => s.documents)
  const folders = useWorkspaceStore((s) => s.folders)
  const openDocument = useTabsStore((s) => s.openDocument)
  const commands = useCommands()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 120)
  const [activeIndex, setActiveIndex] = useState(0)

  const fuse = useMemo(() => buildSearchIndex(documents, folders), [documents, folders])
  const results = useMemo(() => (debouncedQuery.trim() ? search(fuse, debouncedQuery, 12) : []), [fuse, debouncedQuery])

  const recent = useMemo(
    () =>
      [...documents]
        .filter((d) => d.lastOpenedAt)
        .sort((a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0))
        .slice(0, 5),
    [documents],
  )

  const actionCommands = useMemo(() => {
    const ids = ['new-document', 'import-markdown', 'toggle-theme', 'open-settings']
    return commands.filter((c) => ids.includes(c.id)).filter((c) => !query.trim() || c.label.toLowerCase().includes(query.toLowerCase()))
  }, [commands, query])

  const flatItems = useMemo(() => {
    if (query.trim()) {
      return [
        ...results.map((r) => ({ kind: 'result' as const, data: r })),
        ...actionCommands.map((c) => ({ kind: 'action' as const, data: c })),
      ]
    }
    return [
      ...recent.map((d) => ({ kind: 'recent' as const, data: d })),
      ...actionCommands.map((c) => ({ kind: 'action' as const, data: c })),
    ]
  }, [query, results, actionCommands, recent])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => setActiveIndex(0), [debouncedQuery])

  if (!open) return null

  const openDoc = async (id: string) => {
    await openDocument(id)
    close()
    navigate(`/document/${id}`)
  }

  const activate = (index: number) => {
    const item = flatItems[index]
    if (!item) return
    if (item.kind === 'result') openDoc(item.data.documentId)
    else if (item.kind === 'recent') openDoc(item.data.id)
    else {
      close()
      item.data.run()
    }
  }

  return (
    <Portal>
      <div className="overlay-backdrop" onMouseDown={close} style={{ display: 'flex', justifyContent: 'center', paddingTop: '10vh' }}>
        <div
          className="palette"
          style={{ width: 600, maxWidth: '92vw', maxHeight: '68vh', display: 'flex', flexDirection: 'column' }}
          onMouseDown={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Search documentation"
        >
          <input
            ref={inputRef}
            className="input"
            style={{ border: 'none', borderBottom: '1px solid var(--border-subtle)', borderRadius: 0, height: 48, fontSize: 14.5, padding: '0 16px' }}
            placeholder="Search documentation…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActiveIndex((i) => Math.min(flatItems.length - 1, i + 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActiveIndex((i) => Math.max(0, i - 1))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                activate(activeIndex)
              } else if (e.key === 'Escape') {
                close()
              }
            }}
          />
          <div style={{ overflowY: 'auto', padding: 6 }} role="listbox">
            {!query.trim() && recent.length > 0 && <div className="sidebar-section-label">Recent</div>}
            {!query.trim() &&
              recent.map((d, i) => (
                <ResultRow key={d.id} active={i === flatItems.findIndex((it) => it.kind === 'recent' && it.data.id === d.id)} icon={<Clock size={14} />} onClick={() => openDoc(d.id)}>
                  {d.name}
                </ResultRow>
              ))}

            {query.trim() && <div className="sidebar-section-label">Documents</div>}
            {query.trim() && results.length === 0 && (
              <div className="px-3 py-6 text-center text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                No documents found for "{query}"
              </div>
            )}
            {query.trim() &&
              results.map((r, i) => (
                <ResultRow
                  key={r.documentId}
                  active={i === flatItems.findIndex((it) => it.kind === 'result' && it.data.documentId === r.documentId)}
                  icon={<FileText size={14} />}
                  onClick={() => openDoc(r.documentId)}
                >
                  <div className="flex flex-col" style={{ overflow: 'hidden' }}>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {highlightMatches(r.name, query).map((part, idx) =>
                        part.matched ? (
                          <mark key={idx} style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 2 }}>
                            {part.text}
                          </mark>
                        ) : (
                          <span key={idx}>{part.text}</span>
                        ),
                      )}
                    </span>
                    <span className="text-[11.5px]" style={{ color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.folderName ? `${r.folderName} · ` : ''}
                      {r.snippet}
                    </span>
                  </div>
                </ResultRow>
              ))}

            {actionCommands.length > 0 && <div className="sidebar-section-label">Actions</div>}
            {actionCommands.map((c, i) => {
              const Icon = c.icon
              const idx = flatItems.findIndex((it) => it.kind === 'action' && it.data.id === c.id)
              return (
                <ResultRow key={c.id} active={i === idx || idx === activeIndex} icon={<Icon size={14} />} onClick={() => { close(); c.run() }}>
                  {c.label}
                </ResultRow>
              )
            })}
          </div>
          <div className="flex items-center gap-3 text-[11px]" style={{ padding: '8px 14px', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}>
            <span className="flex items-center gap-1"><Zap size={11} /> Fuzzy search across filenames, content & tags</span>
          </div>
        </div>
      </div>
    </Portal>
  )
}

function ResultRow({ children, icon, onClick, active }: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void; active: boolean }) {
  return (
    <div className={`menu-item${active ? ' active' : ''}`} style={{ height: 42 }} onClick={onClick} role="option" aria-selected={active}>
      <span style={{ display: 'flex', color: 'var(--text-tertiary)', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, overflow: 'hidden' }}>{children}</span>
    </div>
  )
}
