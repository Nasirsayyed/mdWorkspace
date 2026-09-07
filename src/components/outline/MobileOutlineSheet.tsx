import { ListTree, X } from 'lucide-react'
import { Portal } from '@/components/common/Portal'
import { useUIStore } from '@/state/uiStore'
import { useOutlineStore, scrollToHeading } from '@/state/outlineStore'

export function MobileOutlineTrigger() {
  const setOpen = useUIStore((s) => s.setMobileOutlineOpen)
  const headings = useOutlineStore((s) => s.headings)
  if (headings.length === 0) return null

  return (
    <button
      type="button"
      className="btn-icon btn-secondary"
      style={{ position: 'fixed', bottom: 18, right: 18, width: 44, height: 44, borderRadius: 999, boxShadow: 'var(--shadow-lg)', zIndex: 60 }}
      onClick={() => setOpen(true)}
      aria-label="Show document outline"
    >
      <ListTree size={18} />
    </button>
  )
}

export function MobileOutlineSheet() {
  const open = useUIStore((s) => s.mobileOutlineOpen)
  const setOpen = useUIStore((s) => s.setMobileOutlineOpen)
  const headings = useOutlineStore((s) => s.headings)
  const activeId = useOutlineStore((s) => s.activeId)

  if (!open) return null
  const minLevel = headings.length ? Math.min(...headings.map((h) => h.level)) : 1

  return (
    <Portal>
      <div className="overlay-backdrop" onMouseDown={() => setOpen(false)} style={{ zIndex: 410, display: 'flex', alignItems: 'flex-end' }}>
        <div
          className="surface-raised"
          style={{ width: '100%', maxHeight: '65vh', borderRadius: '16px 16px 0 0', overflowY: 'auto', boxShadow: 'var(--shadow-overlay)' }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between" style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              On This Page
            </span>
            <button type="button" className="btn-icon btn-ghost" onClick={() => setOpen(false)} aria-label="Close outline">
              <X size={16} />
            </button>
          </div>
          <nav className="p-2" aria-label="Document outline">
            {headings.map((h) => (
              <button
                key={h.id}
                type="button"
                className="nav-item"
                style={{ width: '100%', paddingLeft: 10 + (h.level - minLevel) * 12 }}
                onClick={() => {
                  scrollToHeading(h.id)
                  setOpen(false)
                }}
              >
                <span className="nav-label" style={{ color: activeId === h.id ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: activeId === h.id ? 600 : 450 }}>
                  {h.text}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </Portal>
  )
}
