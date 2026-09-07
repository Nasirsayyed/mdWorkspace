export const EDITOR_FIND_EVENT = 'md-editor-find'
export const EDITOR_REPLACE_EVENT = 'md-editor-replace'
export const EDITOR_FOCUS_EVENT = 'md-editor-focus'
export const RENAME_ACTIVE_DOCUMENT_EVENT = 'md-rename-active-document'

export function dispatchEditorCommand(event: string): void {
  window.dispatchEvent(new CustomEvent(event))
}
