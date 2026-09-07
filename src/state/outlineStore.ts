import { create } from 'zustand'
import type { OutlineItem } from '@/services/markdown'

interface OutlineState {
  headings: OutlineItem[]
  activeId: string | null
  setHeadings: (headings: OutlineItem[]) => void
  setActiveId: (id: string | null) => void
}

export const useOutlineStore = create<OutlineState>((set) => ({
  headings: [],
  activeId: null,
  setHeadings: (headings) => set({ headings }),
  setActiveId: (activeId) => set({ activeId }),
}))

export const SCROLL_TO_HEADING_EVENT = 'md-scroll-to-heading'

export function scrollToHeading(id: string): void {
  window.dispatchEvent(new CustomEvent(SCROLL_TO_HEADING_EVENT, { detail: id }))
}
