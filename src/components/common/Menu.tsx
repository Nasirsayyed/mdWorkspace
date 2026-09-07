import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Portal } from './Portal'
import clsx from 'clsx'

interface MenuProps {
  x: number
  y: number
  onClose: () => void
  children: ReactNode
  width?: number
}

export function Menu({ x, y, onClose, children, width = 210 }: MenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x, y, visible: false })

  useEffect(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const height = ref.current?.offsetHeight ?? 200
    const clampedX = Math.min(x, vw - width - 8)
    const clampedY = Math.min(y, vh - height - 8)
    setPos({ x: Math.max(8, clampedX), y: Math.max(8, clampedY), visible: true })
  }, [x, y, width])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onClick)
    }
  }, [onClose])

  return (
    <Portal>
      <div
        ref={ref}
        role="menu"
        className="menu"
        style={{ position: 'fixed', left: pos.x, top: pos.y, width, opacity: pos.visible ? 1 : 0, zIndex: 150 }}
      >
        {children}
      </div>
    </Portal>
  )
}

interface MenuItemProps {
  onSelect: () => void
  children: ReactNode
  icon?: ReactNode
  danger?: boolean
  disabled?: boolean
  shortcut?: string
}

export function MenuItem({ onSelect, children, icon, danger, disabled, shortcut }: MenuItemProps) {
  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      className={clsx('menu-item', danger && 'danger', disabled && 'disabled')}
      onClick={() => !disabled && onSelect()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      {icon}
      <span style={{ flex: 1 }}>{children}</span>
      {shortcut && <span className="menu-shortcut">{shortcut}</span>}
    </div>
  )
}

export function MenuSeparator() {
  return <div className="menu-separator" role="separator" />
}
