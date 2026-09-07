import { useCallback, useEffect, useRef } from 'react'
import MonacoEditor, { type OnMount } from '@monaco-editor/react'
import type { editor as MonacoEditorNS } from 'monaco-editor'
import { MarkdownToolbar } from './MarkdownToolbar'
import { wrapSelection } from './markdownActions'
import { useSettingsStore } from '@/state/settingsStore'
import { EDITOR_FIND_EVENT, EDITOR_REPLACE_EVENT, EDITOR_FOCUS_EVENT } from '@/utils/events'
import type { ID } from '@/types'

interface EditorProps {
  documentId: ID
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
  onEditorMount?: (editor: MonacoEditorNS.IStandaloneCodeEditor) => void
  hideToolbar?: boolean
}

export function Editor({ documentId, value, onChange, autoFocus, onEditorMount, hideToolbar }: EditorProps) {
  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null)
  const settings = useSettingsStore((s) => s.settings)
  const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'vs-dark' : 'vs'

  const getEditor = useCallback(() => editorRef.current, [])

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    if (autoFocus) editor.focus()

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => wrapSelection(editor, '**'))
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => wrapSelection(editor, '_'))
    onEditorMount?.(editor)
  }

  useEffect(() => {
    function onFind() {
      editorRef.current?.focus()
      editorRef.current?.getAction('actions.find')?.run()
    }
    function onReplace() {
      editorRef.current?.focus()
      editorRef.current?.getAction('editor.action.startFindReplaceAction')?.run()
    }
    function onFocus() {
      editorRef.current?.focus()
    }
    window.addEventListener(EDITOR_FIND_EVENT, onFind)
    window.addEventListener(EDITOR_REPLACE_EVENT, onReplace)
    window.addEventListener(EDITOR_FOCUS_EVENT, onFocus)
    return () => {
      window.removeEventListener(EDITOR_FIND_EVENT, onFind)
      window.removeEventListener(EDITOR_REPLACE_EVENT, onReplace)
      window.removeEventListener(EDITOR_FOCUS_EVENT, onFocus)
    }
  }, [])

  return (
    <div className="flex flex-col h-full min-h-0">
      {!hideToolbar && <MarkdownToolbar getEditor={getEditor} />}
      <div className="flex-1 min-h-0">
        <MonacoEditor
          key={documentId}
          language="markdown"
          theme={theme}
          value={value}
          onChange={(v) => onChange(v ?? '')}
          onMount={handleMount}
          options={{
            fontSize: settings.editorFontSize,
            lineHeight: settings.editorLineHeight * settings.editorFontSize,
            wordWrap: settings.editorWordWrap ? 'on' : 'off',
            minimap: { enabled: settings.editorMinimap },
            lineNumbers: settings.editorLineNumbers ? 'on' : 'off',
            fontFamily: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            renderLineHighlight: 'line',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            automaticLayout: true,
            tabSize: 2,
            quickSuggestions: false,
          }}
        />
      </div>
    </div>
  )
}
