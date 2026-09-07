import { useEffect, useRef, type ReactNode } from 'react'
import { Portal } from '@/components/common/Portal'
import { X } from 'lucide-react'

interface DialogShellProps {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: number
  labelledBy?: string
}

export function DialogShell({ title, onClose, children, footer, width = 440 }: DialogShellProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const firstFocusable = containerRef.current?.querySelector<HTMLElement>('input, textarea, select, button, [tabindex]')
    firstFocusable?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && containerRef.current) {
        const focusables = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [onClose])

  return (
    <Portal>
      <div className="overlay-backdrop" onMouseDown={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="dialog"
          style={{ width, maxWidth: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between" style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 className="text-[14.5px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h2>
            <button type="button" className="btn-icon btn-ghost" onClick={onClose} aria-label="Close dialog">
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: 18, overflowY: 'auto' }}>{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-2" style={{ padding: '12px 18px', borderTop: '1px solid var(--border-subtle)' }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  )
}
