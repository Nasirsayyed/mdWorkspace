import clsx from 'clsx'
import { useOutlineStore, scrollToHeading } from '@/state/outlineStore'
import { EmptyState } from '@/components/common/EmptyState'
import { ListTree } from 'lucide-react'

export function OutlinePanel() {
  const headings = useOutlineStore((s) => s.headings)
  const activeId = useOutlineStore((s) => s.activeId)

  if (headings.length === 0) {
    return (
      <div className="p-2">
        <EmptyState icon={<ListTree size={20} />} title="No headings" description="Add headings to this document to see an outline." />
      </div>
    )
  }

  const minLevel = Math.min(...headings.map((h) => h.level))

  return (
    <nav aria-label="Document outline" className="p-2">
      {headings.map((h) => (
        <button
          key={h.id}
          type="button"
          onClick={() => scrollToHeading(h.id)}
          className="nav-item"
          style={{
            width: '100%',
            paddingLeft: 10 + (h.level - minLevel) * 12,
            fontSize: 12.3,
          }}
        >
          <span
            className={clsx('nav-label')}
            style={{
              color: activeId === h.id ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: activeId === h.id ? 600 : 450,
              borderLeft: activeId === h.id ? '2px solid var(--accent)' : '2px solid transparent',
              paddingLeft: 8,
              marginLeft: -8,
            }}
          >
            {h.text}
          </span>
        </button>
      ))}
    </nav>
  )
}
