import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUIStore } from '@/state/uiStore'
import { useSettingsStore } from '@/state/settingsStore'
import { useTabsStore } from '@/state/tabsStore'

export function useSessionPersistence() {
  const navigate = useNavigate()
  const location = useLocation()
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const settings = useSettingsStore((s) => s.settings)
  const setSettings = useSettingsStore((s) => s.set)
  const tabs = useTabsStore((s) => s.tabs)
  const activeTabId = useTabsStore((s) => s.activeTabId)

  const initializedSidebar = useRef(false)
  const attemptedAutoOpen = useRef(false)

  useEffect(() => {
    if (initializedSidebar.current) return
    initializedSidebar.current = true
    useUIStore.setState({ sidebarOpen: !settings.sidebarCollapsed })
  }, [settings.sidebarCollapsed])

  useEffect(() => {
    if (!initializedSidebar.current) return
    if (sidebarOpen === !settings.sidebarCollapsed) return
    setSettings({ sidebarCollapsed: !sidebarOpen })
  }, [sidebarOpen, settings.sidebarCollapsed, setSettings])

  useEffect(() => {
    if (attemptedAutoOpen.current) return
    if (location.pathname !== '/') return
    attemptedAutoOpen.current = true
    if (!settings.autoOpenLastDocument || !settings.restoreTabs) return
    const activeTab = tabs.find((t) => t.id === activeTabId)
    if (activeTab) navigate(`/document/${activeTab.documentId}`)
  }, [tabs, activeTabId, settings.autoOpenLastDocument, settings.restoreTabs, location.pathname, navigate])
}
