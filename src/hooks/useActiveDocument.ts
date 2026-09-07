import { useTabsStore } from '@/state/tabsStore'
import { useWorkspaceStore } from '@/state/workspaceStore'
import type { MDDocument } from '@/types'

export function useActiveDocument(): MDDocument | undefined {
  const activeTabId = useTabsStore((s) => s.activeTabId)
  const tabs = useTabsStore((s) => s.tabs)
  const documents = useWorkspaceStore((s) => s.documents)
  const activeTab = tabs.find((t) => t.id === activeTabId)
  return activeTab ? documents.find((d) => d.id === activeTab.documentId) : undefined
}
