import { Outlet, useLocation, useMatch } from 'react-router-dom'
import clsx from 'clsx'
import { TopBar } from './TopBar'
import { StatusBar } from './StatusBar'
import { Sidebar, SidebarContent } from '@/components/sidebar/Sidebar'
import { TabBar } from '@/components/tabs/TabBar'
import { OutlinePanel } from '@/components/outline/OutlinePanel'
import { MobileOutlineTrigger, MobileOutlineSheet } from '@/components/outline/MobileOutlineSheet'
import { DialogHost } from '@/components/dialogs/DialogHost'
import { Toaster } from '@/components/common/Toaster'
import { CommandPalette } from '@/components/command-palette/CommandPalette'
import { SearchOverlay } from '@/components/search/SearchOverlay'
import { GlobalDropZone } from '@/components/common/GlobalDropZone'
import { Portal } from '@/components/common/Portal'
import { useUIStore } from '@/state/uiStore'
import { useSettingsStore } from '@/state/settingsStore'
import { useTabsStore } from '@/state/tabsStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSessionPersistence } from '@/hooks/useSessionPersistence'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { X } from 'lucide-react'

export function AppShell() {
  useKeyboardShortcuts()
  useSessionPersistence()
  const isMobile = useIsMobile()
  const location = useLocation()
  const isDocumentRoute = !!useMatch('/document/:id')
  const focusMode = useUIStore((s) => s.focusMode)
  const setFocusMode = useUIStore((s) => s.setFocusMode)
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen)
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen)
  const settings = useSettingsStore((s) => s.settings)
  const tabs = useTabsStore((s) => s.tabs)

  const showOutline = isDocumentRoute && settings.showOutline && !focusMode && !isMobile
  const showMobileOutline = isDocumentRoute && settings.showOutline && !focusMode && isMobile
  const showTabBar = tabs.length > 0 && !focusMode

  return (
    <div className="app-shell">
      {!focusMode && <TopBar />}
      {focusMode && (
        <div className="topbar" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setFocusMode(false)}>
            <X size={13} />
            Exit Focus Mode
          </button>
        </div>
      )}

      <div className="workspace-body">
        {!isMobile && !focusMode && <Sidebar />}

        <div className="flex flex-col min-w-0 min-h-0">
          {showTabBar && <TabBar />}
          <main className="flex-1 min-h-0 overflow-auto" key={location.pathname}>
            <Outlet />
          </main>
        </div>

        {showOutline && (
          <aside className="outline-panel" style={{ width: 220, borderLeft: '1px solid var(--border-subtle)', overflowY: 'auto', background: 'var(--bg-surface)' }} aria-label="Document outline">
            <div className="sidebar-section-label" style={{ paddingTop: 14 }}>
              On This Page
            </div>
            <OutlinePanel />
          </aside>
        )}
      </div>

      {!focusMode && <StatusBar />}

      {isMobile && mobileSidebarOpen && (
        <Portal>
          <div className="overlay-backdrop" onMouseDown={() => setMobileSidebarOpen(false)} style={{ zIndex: 400 }}>
            <div
              className={clsx('sidebar')}
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, zIndex: 401, boxShadow: 'var(--shadow-overlay)' }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <SidebarContent />
            </div>
          </div>
        </Portal>
      )}

      {showMobileOutline && <MobileOutlineTrigger />}
      <MobileOutlineSheet />

      <GlobalDropZone />
      <DialogHost />
      <CommandPalette />
      <SearchOverlay />
      <Toaster />
    </div>
  )
}
