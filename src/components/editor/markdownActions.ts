import type { editor as MonacoEditorNS, Selection } from 'monaco-editor'

type Editor = MonacoEditorNS.IStandaloneCodeEditor

export function wrapSelection(editor: Editor, before: string, after: string = before): void {
  const model = editor.getModel()
  const selection = editor.getSelection()
  if (!model || !selection) return

  const text = model.getValueInRange(selection)
  const newText = `${before}${text}${after}`
  editor.executeEdits('toolbar', [{ range: selection, text: newText, forceMoveMarkers: true }])

  if (!text) {
    const pos = selection.getStartPosition()
    const newPos = { lineNumber: pos.lineNumber, column: pos.column + before.length }
    editor.setPosition(newPos)
  }
  editor.focus()
}

export function toggleLinePrefix(editor: Editor, prefix: string): void {
  const model = editor.getModel()
  const selection = editor.getSelection()
  if (!model || !selection) return

  const startLine = selection.startLineNumber
  const endLine = selection.endLineNumber
  const edits: MonacoEditorNS.IIdentifiedSingleEditOperation[] = []

  for (let line = startLine; line <= endLine; line++) {
    const content = model.getLineContent(line)
    const range = { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 }
    if (content.startsWith(prefix)) {
      edits.push({ range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: prefix.length + 1 }, text: '' })
    } else {
      edits.push({ range, text: prefix })
    }
  }
  editor.executeEdits('toolbar', edits)
  editor.focus()
}

export function insertAtCursor(editor: Editor, text: string): void {
  const selection = editor.getSelection()
  if (!selection) return
  editor.executeEdits('toolbar', [{ range: selection, text, forceMoveMarkers: true }])
  editor.focus()
}

export function insertBlock(editor: Editor, textFn: (selected: string) => string): void {
  const model = editor.getModel()
  const selection = editor.getSelection()
  if (!model || !selection) return
  const selected = model.getValueInRange(selection)
  const text = textFn(selected)
  editor.executeEdits('toolbar', [{ range: selection as Selection, text, forceMoveMarkers: true }])
  editor.focus()
}

export const markdownTable = `| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Value | Value | Value |\n`
