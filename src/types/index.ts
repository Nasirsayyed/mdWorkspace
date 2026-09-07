export type ID = string

export interface MDDocument {
  id: ID
  name: string
  content: string
  folderId: ID | null
  createdAt: number
  updatedAt: number
  lastOpenedAt: number | null
  isFavorite: boolean
  isPinned: boolean
  tags: string[]
  wordCount: number
  characterCount: number
  readingTime: number
  version: number
  isDemo?: boolean
  readingProgress?: number
  deletedAt?: number | null
}

export interface Folder {
  id: ID
  name: string
  parentId: ID | null
  createdAt: number
  updatedAt: number
  color: string | null
  icon: string | null
}

export type ThemeMode = 'light' | 'dark' | 'system'
export type AccentColor =
  | 'indigo'
  | 'blue'
  | 'teal'
  | 'green'
  | 'amber'
  | 'rose'
  | 'violet'
  | 'slate'
export type FontFamily = 'system' | 'inter' | 'serif' | 'mono'
export type LineHeightPref = 'compact' | 'comfortable' | 'relaxed'
export type ContentWidth = 'narrow' | 'comfortable' | 'wide'
export type DefaultView = 'edit' | 'split' | 'preview'
export type AutoSaveInterval = 'off' | '1s' | '3s' | '5s'
export type Density = 'compact' | 'comfortable'

export interface WorkspaceSettings {
  id: 'settings'
  theme: ThemeMode
  accentColor: AccentColor
  fontFamily: FontFamily
  fontSize: number
  lineHeight: LineHeightPref
  contentWidth: ContentWidth
  sidebarWidth: number
  readingWidth: number
  defaultView: DefaultView
  showOutline: boolean
  showStats: boolean
  showBreadcrumbs: boolean
  autoSave: AutoSaveInterval
  autoOpenLastDocument: boolean
  confirmDelete: boolean
  restoreTabs: boolean
  restoreScrollPosition: boolean
  density: Density
  editorFontSize: number
  editorLineHeight: number
  editorWordWrap: boolean
  editorMinimap: boolean
  editorLineNumbers: boolean
  onboardingComplete: boolean
  demoDataRemoved: boolean
  sidebarCollapsed: boolean
}

export interface Tab {
  id: ID
  documentId: ID
  isPinned: boolean
  order: number
  scrollPosition?: number
}

export interface DocumentVersion {
  id: ID
  documentId: ID
  content: string
  createdAt: number
  label?: string
}

export interface WorkspaceBackup {
  formatVersion: 1
  exportedAt: number
  documents: MDDocument[]
  folders: Folder[]
  settings: WorkspaceSettings
  versions: DocumentVersion[]
  tabs: Tab[]
}

export type EditorMode = 'edit' | 'split' | 'preview'

export interface DocumentStats {
  words: number
  characters: number
  charactersNoSpaces: number
  lines: number
  headings: number
  links: number
  images: number
  codeBlocks: number
  readingTime: number
}

export interface SearchResultItem {
  documentId: ID
  name: string
  folderName: string | null
  snippet: string
  matchType: 'name' | 'content' | 'tag' | 'heading'
  score: number
}

export interface Toast {
  id: ID
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}
