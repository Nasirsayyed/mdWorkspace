import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { X, Plus, Pin } from 'lucide-react'
import clsx from 'clsx'
import { useTabsStore } from '@/state/tabsStore'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useUIStore } from '@/state/uiStore'
import { Menu, MenuItem, MenuSeparator } from '@/components/common/Menu'
import type { ID } from '@/types'

export function TabBar() {
  const navigate = useNavigate()
  const tabs = useTabsStore((s) => s.tabs)
  const activeTabId = useTabsStore((s) => s.activeTabId)
  const setActiveTab = useTabsStore((s) => s.setActiveTab)
  const closeTab = useTabsStore((s) => s.closeTab)
  const closeOthers = useTabsStore((s) => s.closeOthers)
  const closeAll = useTabsStore((s) => s.closeAll)
  const togglePinTab = useTabsStore((s) => s.togglePinTab)
  const reorderTabs = useTabsStore((s) => s.reorderTabs)
  const isDirty = useTabsStore((s) => s.drafts)
  const documents = useWorkspaceStore((s) => s.documents)
  const openDialog = useUIStore((s) => s.openDialog)

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [menu, setMenu] = useState<{ x: number; y: number; tabId: ID } | null>(null)

  const sorted = [...tabs].sort((a, b) => a.order - b.order)

  const openTab = (tabId: ID, documentId: ID) => {
    setActiveTab(tabId)
    navigate(`/document/${documentId}`)
  }

  return (
    <div className="tab-bar" role="tablist" aria-label="Open documents">
      {sorted.map((tab, index) => {
        const doc = documents.find((d) => d.id === tab.documentId)
        if (!doc) return null
        const dirty = isDirty[tab.documentId] !== undefined
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeTabId}
            tabIndex={0}
            className={clsx('tab', tab.id === activeTabId && 'active', tab.isPinned && 'pinned', dragIndex === index && 'dragging')}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== index) reorderTabs(dragIndex, index)
              setDragIndex(null)
            }}
            onDragEnd={() => setDragIndex(null)}
            onClick={() => openTab(tab.id, tab.documentId)}
            onAuxClick={(e) => {
              if (e.button === 1) closeTab(tab.id)
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              setMenu({ x: e.clientX, y: e.clientY, tabId: tab.id })
            }}
            title={doc.name}
          >
            {tab.isPinned && <Pin size={11} style={{ flexShrink: 0 }} />}
            <span className="tab-name">{doc.name}</span>
            {dirty && <span className="tab-dot" aria-label="Unsaved changes" />}
            <button
              type="button"
              className="tab-close"
              aria-label={`Close ${doc.name}`}
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
            >
              <X size={12} />
            </button>
          </div>
        )
      })}
      <button type="button" className="tab-new-btn" aria-label="New document" onClick={() => openDialog({ type: 'newDocument' })}>
        <Plus size={15} />
      </button>

      {menu && (
        <Menu x={menu.x} y={menu.y} onClose={() => setMenu(null)}>
          <MenuItem onSelect={() => { closeTab(menu.tabId); setMenu(null) }} shortcut="⌘W">Close</MenuItem>
          <MenuItem onSelect={() => { closeOthers(menu.tabId); setMenu(null) }}>Close Others</MenuItem>
          <MenuItem onSelect={() => { closeAll(); setMenu(null) }}>Close All</MenuItem>
          <MenuSeparator />
          <MenuItem onSelect={() => { togglePinTab(menu.tabId); setMenu(null) }}>
            {tabs.find((t) => t.id === menu.tabId)?.isPinned ? 'Unpin Tab' : 'Pin Tab'}
          </MenuItem>
        </Menu>
      )}
    </div>
  )
}
