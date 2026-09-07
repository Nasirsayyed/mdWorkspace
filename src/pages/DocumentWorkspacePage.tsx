import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { editor as MonacoEditorNS } from 'monaco-editor'
import { FileQuestion } from 'lucide-react'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useTabsStore } from '@/state/tabsStore'
import { useViewMode } from '@/hooks/useViewMode'
import { Editor } from '@/components/editor/Editor'
import { Preview } from '@/components/preview/Preview'
import { DocumentHeader } from '@/components/document/DocumentHeader'
import { EmptyState } from '@/components/common/EmptyState'

export function DocumentWorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const documents = useWorkspaceStore((s) => s.documents)
  const openDocument = useTabsStore((s) => s.openDocument)
  const setActiveTab = useTabsStore((s) => s.setActiveTab)
  const tabs = useTabsStore((s) => s.tabs)
  const drafts = useTabsStore((s) => s.drafts)
  const setDraft = useTabsStore((s) => s.setDraft)

  const doc = documents.find((d) => d.id === id)
  const [viewMode, setViewMode] = useViewMode(id)

  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const syncingRef = useRef(false)

  const [resumeChoice, setResumeChoice] = useState<'pending' | 'resume' | 'top'>('top')
  const resolvedForDoc = useRef<string | null>(null)

  useEffect(() => {
    if (!id) return
    const existingTab = tabs.find((t) => t.documentId === id)
    if (existingTab) setActiveTab(existingTab.id)
    else openDocument(id)
  }, [id, tabs, setActiveTab, openDocument])

  useEffect(() => {
    if (!doc) return
    if (resolvedForDoc.current === doc.id) return
    if ((doc.readingProgress ?? 0) > 0.08 && viewMode !== 'edit') {
      setResumeChoice('pending')
    } else {
      resolvedForDoc.current = doc.id
      setResumeChoice('top')
    }
  }, [doc, viewMode])

  if (!id) return null

  if (!doc) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={<FileQuestion size={22} />}
          title="Document not found"
          description="It may have been deleted or moved to Trash."
          actions={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/documents')}>
              Back to Documents
            </button>
          }
        />
      </div>
    )
  }

  const content = drafts[doc.id] ?? doc.content

  const attachSync = () => {
    if (viewMode !== 'split') return
    const editor = editorRef.current
    const preview = previewRef.current
    if (!editor || !preview) return () => {}

    const onEditorScroll = () => {
      if (syncingRef.current) return
      syncingRef.current = true
      const scrollTop = editor.getScrollTop()
      const scrollHeight = editor.getScrollHeight() - editor.getLayoutInfo().height
      const ratio = scrollHeight > 0 ? scrollTop / scrollHeight : 0
      const previewMax = preview.scrollHeight - preview.clientHeight
      preview.scrollTop = ratio * previewMax
      requestAnimationFrame(() => (syncingRef.current = false))
    }
    const disposable = editor.onDidScrollChange(onEditorScroll)

    const onPreviewScroll = () => {
      if (syncingRef.current) return
      syncingRef.current = true
      const previewMax = preview.scrollHeight - preview.clientHeight
      const ratio = previewMax > 0 ? preview.scrollTop / previewMax : 0
      const scrollHeight = editor.getScrollHeight() - editor.getLayoutInfo().height
      editor.setScrollTop(ratio * scrollHeight)
      requestAnimationFrame(() => (syncingRef.current = false))
    }
    preview.addEventListener('scroll', onPreviewScroll)

    return () => {
      disposable.dispose()
      preview.removeEventListener('scroll', onPreviewScroll)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <DocumentHeader doc={doc} viewMode={viewMode} onViewModeChange={setViewMode} />

      {resumeChoice === 'pending' && (
        <div
          className="flex items-center justify-between flex-wrap gap-2"
          style={{ padding: '10px 24px', background: 'var(--accent-soft)', borderBottom: '1px solid var(--border-subtle)' }}
        >
          <span className="text-[12.5px]" style={{ color: 'var(--text-primary)' }}>
            Continue from where you left off? ({Math.round((doc.readingProgress ?? 0) * 100)}% read)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                resolvedForDoc.current = doc.id
                setResumeChoice('top')
              }}
            >
              Start from Top
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                resolvedForDoc.current = doc.id
                setResumeChoice('resume')
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <div className="progress-track" style={{ borderRadius: 0, height: 3 }}>
        <div className="progress-fill" style={{ width: `${Math.round((doc.readingProgress ?? 0) * 100)}%`, borderRadius: 0 }} />
      </div>

      <div className="flex-1 min-h-0" style={{ display: 'grid', gridTemplateColumns: viewMode === 'split' ? '1fr 1fr' : '1fr' }}>
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div style={{ minWidth: 0, borderRight: viewMode === 'split' ? '1px solid var(--border-subtle)' : undefined }}>
            <Editor
              documentId={doc.id}
              value={content}
              onChange={(v) => setDraft(doc.id, v)}
              onEditorMount={(editor) => {
                editorRef.current = editor
                attachSync()
              }}
              hideToolbar={viewMode === 'split'}
            />
          </div>
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div style={{ minWidth: 0 }}>
            <Preview
              documentId={doc.id}
              content={content}
              scrollContainerRef={(el) => {
                previewRef.current = el
                attachSync()
              }}
              resumeProgress={resumeChoice === 'resume' ? doc.readingProgress : null}
            />
          </div>
        )}
      </div>
    </div>
  )
}
