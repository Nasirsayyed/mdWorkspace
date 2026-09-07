import type { editor as MonacoEditorNS } from 'monaco-editor'
import { Bold, Italic, Strikethrough, Heading1, Heading2, Link2, Image, Code, Quote, List, ListOrdered, Table, CheckSquare } from 'lucide-react'
import { wrapSelection, toggleLinePrefix, insertBlock, markdownTable } from './markdownActions'

interface ToolbarProps {
  getEditor: () => MonacoEditorNS.IStandaloneCodeEditor | null
}

const buttons = [
  { icon: Bold, label: 'Bold', shortcut: '⌘B', action: (e: MonacoEditorNS.IStandaloneCodeEditor) => wrapSelection(e, '**') },
  { icon: Italic, label: 'Italic', shortcut: '⌘I', action: (e: MonacoEditorNS.IStandaloneCodeEditor) => wrapSelection(e, '_') },
  { icon: Strikethrough, label: 'Strikethrough', action: (e: MonacoEditorNS.IStandaloneCodeEditor) => wrapSelection(e, '~~') },
  { divider: true },
  { icon: Heading1, label: 'Heading 1', action: (e: MonacoEditorNS.IStandaloneCodeEditor) => toggleLinePrefix(e, '# ') },
  { icon: Heading2, label: 'Heading 2', action: (e: MonacoEditorNS.IStandaloneCodeEditor) => toggleLinePrefix(e, '## ') },
  { divider: true },
  { icon: Link2, label: 'Link', action: (e: MonacoEditorNS.IStandaloneCodeEditor) => insertBlock(e, (s) => `[${s || 'link text'}](https://)`) },
  { icon: Image, label: 'Image', action: (e: MonacoEditorNS.IStandaloneCodeEditor) => insertBlock(e, (s) => `![${s || 'alt text'}](https://)`) },
  { icon: Code, label: 'Code', action: (e: MonacoEditorNS.IStandaloneCodeEditor) => insertBlock(e, (s) => (s.includes('\n') ? `\`\`\`\n${s}\n\`\`\`\n` : `\`${s || 'code'}\``)) },
  { icon: Quote, label: 'Quote', action: (e: MonacoEditorNS.IStandaloneCodeEditor) => toggleLinePrefix(e, '> ') },
  { divider: true },
  { icon: List, label: 'Bullet List', action: (e: MonacoEditorNS.IStandaloneCodeEditor) => toggleLinePrefix(e, '- ') },
  { icon: ListOrdered, label: 'Numbered List', action: (e: MonacoEditorNS.IStandaloneCodeEditor) => toggleLinePrefix(e, '1. ') },
  { icon: CheckSquare, label: 'Task List', action: (e: MonacoEditorNS.IStandaloneCodeEditor) => toggleLinePrefix(e, '- [ ] ') },
  { icon: Table, label: 'Table', action: (e: MonacoEditorNS.IStandaloneCodeEditor) => insertBlock(e, () => markdownTable) },
] as const

export function MarkdownToolbar({ getEditor }: ToolbarProps) {
  return (
    <div className="flex items-center gap-0.5 flex-wrap" style={{ padding: '5px 8px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }} role="toolbar" aria-label="Formatting">
      {buttons.map((btn, i) => {
        if ('divider' in btn) return <span key={i} style={{ width: 1, height: 18, background: 'var(--border-subtle)', margin: '0 4px' }} />
        const Icon = btn.icon
        return (
          <button
            type="button"
            key={btn.label}
            className="btn-icon btn-ghost"
            style={{ width: 28, height: 28 }}
            title={`${btn.label}${'shortcut' in btn && btn.shortcut ? ` (${btn.shortcut})` : ''}`}
            aria-label={btn.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const editor = getEditor()
              if (editor) btn.action(editor)
            }}
          >
            <Icon size={14} />
          </button>
        )
      })}
    </div>
  )
}
