import { useEffect, useMemo, useRef } from 'react'
import { MarkdownRenderer, extractOutline } from '@/services/markdown'
import { useOutlineStore, SCROLL_TO_HEADING_EVENT } from '@/state/outlineStore'
import { useSettingsStore } from '@/state/settingsStore'
import { useWorkspaceStore } from '@/state/workspaceStore'
import type { ID } from '@/types'

interface PreviewProps {
  documentId: ID
  content: string
  scrollContainerRef?: (el: HTMLDivElement | null) => void
  resumeProgress?: number | null
}

const FONT_MAP: Record<string, string> = {
  system: 'var(--font-system)',
  inter: 'var(--font-sans)',
  serif: 'var(--font-serif)',
  mono: 'var(--font-mono)',
}
const LINE_HEIGHT_MAP: Record<string, number> = { compact: 1.45, comfortable: 1.7, relaxed: 1.95 }
const WIDTH_MAP: Record<string, number> = { narrow: 580, comfortable: 720, wide: 920 }

export function Preview({ documentId, content, scrollContainerRef, resumeProgress }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const setHeadings = useOutlineStore((s) => s.setHeadings)
  const setActiveId = useOutlineStore((s) => s.setActiveId)
  const settings = useSettingsStore((s) => s.settings)
  const updateDocument = useWorkspaceStore((s) => s.updateDocument)
  const progressTimer = useRef<number | undefined>(undefined)
  const hasResumed = useRef(false)

  const outline = useMemo(() => extractOutline(content), [content])

  useEffect(() => {
    setHeadings(outline)
  }, [outline, setHeadings])

  useEffect(() => {
    hasResumed.current = false
  }, [documentId])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const headingEls = Array.from(container.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]'))
    if (headingEls.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { root: container, rootMargin: '-10% 0px -70% 0px', threshold: [0, 1] },
    )
    headingEls.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [outline, setActiveId])

  useEffect(() => {
    function onScrollTo(e: Event) {
      const id = (e as CustomEvent<string>).detail
      const container = containerRef.current
      const target = container?.querySelector(`#${CSS.escape(id)}`)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    window.addEventListener(SCROLL_TO_HEADING_EVENT, onScrollTo)
    return () => window.removeEventListener(SCROLL_TO_HEADING_EVENT, onScrollTo)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container || hasResumed.current || !resumeProgress) return
    hasResumed.current = true
    requestAnimationFrame(() => {
      const max = container.scrollHeight - container.clientHeight
      if (max > 0) container.scrollTop = max * resumeProgress
    })
  }, [resumeProgress, content])

  const handleScroll = () => {
    const container = containerRef.current
    if (!container) return
    window.clearTimeout(progressTimer.current)
    progressTimer.current = window.setTimeout(() => {
      const max = container.scrollHeight - container.clientHeight
      const progress = max > 0 ? Math.max(0, Math.min(1, container.scrollTop / max)) : 0
      updateDocument(documentId, { readingProgress: progress }, { touch: false })
    }, 500)
  }

  return (
    <div
      ref={(el) => {
        containerRef.current = el
        scrollContainerRef?.(el)
      }}
      onScroll={handleScroll}
      className="h-full overflow-auto"
      style={{ padding: '32px 40px 120px' }}
    >
      <MarkdownRenderer
        content={content}
        className="markdown-body"
      />
      <style>{`
        .markdown-body {
          --reading-font: ${FONT_MAP[settings.fontFamily]};
          --reading-size: ${settings.fontSize}px;
          --reading-line-height: ${LINE_HEIGHT_MAP[settings.lineHeight]};
          --reading-width: ${WIDTH_MAP[settings.contentWidth]}px;
        }
      `}</style>
    </div>
  )
}
