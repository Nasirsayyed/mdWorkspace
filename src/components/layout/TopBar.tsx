import { useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { Search, Plus, Sun, Moon, Laptop, Settings, Menu as MenuIcon, MoreHorizontal, Maximize2, Download, Keyboard, Info } from 'lucide-react'
import { useUIStore } from '@/state/uiStore'
import { useSettingsStore } from '@/state/settingsStore'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { Menu, MenuItem, MenuSeparator } from '@/components/common/Menu'
import { downloadWorkspaceBackup } from '@/services/backup'
import { toast } from '@/state/toastStore'
import type { ThemeMode } from '@/types'

const THEME_ICONS: Record<ThemeMode, typeof Sun> = { light: Sun, dark: Moon, system: Laptop }
const THEME_ORDER: ThemeMode[] = ['light', 'dark', 'system']

export function TopBar() {
  const navigate = useNavigate()
  const openSearch = useUIStore((s) => s.openSearch)
  const openDialog = useUIStore((s) => s.openDialog)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen)
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode)
  const settings = useSettingsStore((s) => s.settings)
  const setSettings = useSettingsStore((s) => s.set)
  const isMobile = useIsMobile()

  const [moreOpen, setMoreOpen] = useState<{ x: number; y: number } | null>(null)
  const moreBtnRef = useRef<HTMLButtonElement>(null)

  const ThemeIcon = THEME_ICONS[settings.theme]

  const cycleTheme = () => {
    const idx = THEME_ORDER.indexOf(settings.theme)
    setSettings({ theme: THEME_ORDER[(idx + 1) % THEME_ORDER.length] })
  }

  return (
    <header className="topbar">
      <button
        type="button"
        className="btn-icon btn-ghost"
        onClick={() => (isMobile ? setMobileSidebarOpen(true) : toggleSidebar())}
        aria-label="Toggle sidebar"
      >
        <MenuIcon size={17} />
      </button>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="flex items-center gap-2 shrink-0"
        style={{ fontWeight: 650, fontSize: 14, color: 'var(--text-primary)' }}
      >
        <span
          className="flex items-center justify-center rounded-lg"
          style={{ width: 24, height: 24, background: 'var(--accent)', color: 'white', fontSize: 12 }}
          aria-hidden="true"
        >
          ◈
        </span>
        {!isMobile && <span>Markdown Workspace</span>}
      </button>

      <button
        type="button"
        onClick={openSearch}
        className="flex items-center gap-2 flex-1"
        style={{
          maxWidth: 480,
          minWidth: 0,
          height: 32,
          margin: '0 auto',
          padding: '0 10px',
          borderRadius: 8,
          border: '1px solid var(--border-default)',
          background: 'var(--bg-sunken)',
          color: 'var(--text-tertiary)',
          fontSize: 12.5,
        }}
      >
        <Search size={14} style={{ flexShrink: 0 }} />
        <span className="flex-1 text-left" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isMobile ? 'Search…' : 'Search documentation…'}
        </span>
        {!isMobile && (
          <>
            <span className="kbd">⌘</span>
            <span className="kbd">K</span>
          </>
        )}
      </button>

      <div className="flex items-center gap-1.5 ml-auto">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => openDialog({ type: 'newDocument' })}>
          <Plus size={14} />
          {!isMobile && 'New'}
        </button>
        <button type="button" className="btn-icon btn-ghost" onClick={cycleTheme} aria-label={`Theme: ${settings.theme}`} title={`Theme: ${settings.theme}`}>
          <ThemeIcon size={16} />
        </button>
        <button type="button" className="btn-icon btn-ghost" onClick={() => navigate('/settings')} aria-label="Settings">
          <Settings size={16} />
        </button>
        <button
          type="button"
          ref={moreBtnRef}
          className="btn-icon btn-ghost"
          aria-label="More options"
          onClick={() => {
            const rect = moreBtnRef.current?.getBoundingClientRect()
            setMoreOpen(rect ? { x: rect.right - 210, y: rect.bottom + 6 } : { x: 0, y: 0 })
          }}
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {moreOpen && (
        <Menu x={moreOpen.x} y={moreOpen.y} onClose={() => setMoreOpen(null)}>
          <MenuItem
            icon={<Maximize2 size={14} />}
            onSelect={() => {
              toggleFocusMode()
              setMoreOpen(null)
            }}
            shortcut="⌘⇧F"
          >
            Focus Mode
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            icon={<Download size={14} />}
            onSelect={async () => {
              await downloadWorkspaceBackup()
              toast.success('Workspace exported')
              setMoreOpen(null)
            }}
          >
            Export Workspace
          </MenuItem>
          <MenuItem
            icon={<Keyboard size={14} />}
            onSelect={() => {
              navigate('/settings?section=shortcuts')
              setMoreOpen(null)
            }}
          >
            Keyboard Shortcuts
          </MenuItem>
          <MenuItem
            icon={<Info size={14} />}
            onSelect={() => {
              navigate('/settings?section=about')
              setMoreOpen(null)
            }}
          >
            About
          </MenuItem>
        </Menu>
      )}
    </header>
  )
}
