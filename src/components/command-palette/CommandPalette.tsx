import { useEffect, useMemo, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import { useUIStore } from '@/state/uiStore'
import { useCommands } from '@/hooks/useCommands'
import { Portal } from '@/components/common/Portal'

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen)
  const close = useUIStore((s) => s.closeCommandPalette)
  const commands = useCommands()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const fuse = useMemo(() => new Fuse(commands, { keys: ['label', 'group'], threshold: 0.4 }), [commands])
  const results = query.trim() ? fuse.search(query).map((r) => r.item) : commands

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => setActiveIndex(0), [query])

  if (!open) return null

  const runCommand = (index: number) => {
    const cmd = results[index]
    if (!cmd) return
    close()
    cmd.run()
  }

  return (
    <Portal>
      <div className="overlay-backdrop" onMouseDown={close} style={{ display: 'flex', justifyContent: 'center', paddingTop: '12vh' }}>
        <div
          className="palette"
          style={{ width: 560, maxWidth: '92vw', maxHeight: '60vh', display: 'flex', flexDirection: 'column' }}
          onMouseDown={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <input
            ref={inputRef}
            className="input"
            style={{ border: 'none', borderBottom: '1px solid var(--border-subtle)', borderRadius: 0, height: 46, fontSize: 14, padding: '0 16px' }}
            placeholder="Type a command…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActiveIndex((i) => Math.min(results.length - 1, i + 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActiveIndex((i) => Math.max(0, i - 1))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                runCommand(activeIndex)
              } else if (e.key === 'Escape') {
                close()
              }
            }}
          />
          <div style={{ overflowY: 'auto', padding: 6 }} role="listbox">
            {results.length === 0 && (
              <div className="px-3 py-6 text-center text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                No matching commands
              </div>
            )}
            {results.map((cmd, i) => {
              const Icon = cmd.icon
              return (
                <div
                  key={cmd.id}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={`menu-item${i === activeIndex ? ' active' : ''}`}
                  style={{ height: 36 }}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => runCommand(i)}
                >
                  <span style={{ display: 'flex', color: 'var(--text-tertiary)' }}>
                    <Icon size={15} />
                  </span>
                  <span style={{ flex: 1 }}>{cmd.label}</span>
                  <span className="menu-shortcut" style={{ marginRight: cmd.shortcut ? 0 : undefined }}>
                    {cmd.shortcut}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Portal>
  )
}
