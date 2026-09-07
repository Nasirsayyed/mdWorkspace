import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  SlidersHorizontal, Palette, Code2, BookOpen, Layers, Database, Keyboard, Info,
} from 'lucide-react'
import clsx from 'clsx'
import { useSettingsStore } from '@/state/settingsStore'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { confirmDialog } from '@/state/uiStore'
import { downloadWorkspaceBackup, parseBackupFile, restoreWorkspace } from '@/services/backup'
import { getStorageEstimate, clearAllData } from '@/storage/db'
import { formatBytes } from '@/utils/text'
import { toast } from '@/state/toastStore'
import { seedDemoWorkspace } from '@/data/seedDemoWorkspace'
import type { AccentColor, ThemeMode, FontFamily, LineHeightPref, ContentWidth, DefaultView, AutoSaveInterval, Density } from '@/types'

const SECTIONS = [
  { id: 'general', label: 'General', icon: SlidersHorizontal },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'editor', label: 'Editor', icon: Code2 },
  { id: 'reading', label: 'Reading', icon: BookOpen },
  { id: 'workspace', label: 'Workspace', icon: Layers },
  { id: 'storage', label: 'Storage', icon: Database },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'about', label: 'About', icon: Info },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

const ACCENTS: AccentColor[] = ['indigo', 'blue', 'teal', 'green', 'amber', 'rose', 'violet', 'slate']
const ACCENT_HEX: Record<AccentColor, string> = {
  indigo: '#4f46e5',
  blue: '#2563eb',
  teal: '#0d9488',
  green: '#16a34a',
  amber: '#d97706',
  rose: '#e11d48',
  violet: '#7c3aed',
  slate: '#475569',
}

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initial = (searchParams.get('section') as SectionId) || 'general'
  const [section, setSection] = useState<SectionId>(SECTIONS.some((s) => s.id === initial) ? initial : 'general')
  const settings = useSettingsStore((s) => s.settings)
  const setSettings = useSettingsStore((s) => s.set)
  const resetSettings = useSettingsStore((s) => s.reset)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', maxWidth: 920, margin: '0 auto', padding: '28px' }}>
      <nav aria-label="Settings sections">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={clsx('nav-item', section === s.id && 'active')}
            style={{ width: '100%' }}
            onClick={() => {
              setSection(s.id)
              setSearchParams(s.id === 'general' ? {} : { section: s.id })
            }}
          >
            <span className="nav-icon"><s.icon size={15} /></span>
            <span className="nav-label">{s.label}</span>
          </button>
        ))}
      </nav>

      <div style={{ padding: '4px 8px 60px 28px', maxWidth: 560 }}>
        {section === 'general' && <GeneralSection settings={settings} setSettings={setSettings} />}
        {section === 'appearance' && <AppearanceSection settings={settings} setSettings={setSettings} />}
        {section === 'editor' && <EditorSection settings={settings} setSettings={setSettings} />}
        {section === 'reading' && <ReadingSection settings={settings} setSettings={setSettings} onReset={resetSettings} />}
        {section === 'workspace' && <WorkspaceSection settings={settings} setSettings={setSettings} />}
        {section === 'storage' && <StorageSection />}
        {section === 'shortcuts' && <ShortcutsSection />}
        {section === 'about' && <AboutSection />}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
      {children}
    </h2>
  )
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4" style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </span>
        {description && (
          <span className="text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
            {description}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={clsx('switch', checked && 'checked')}
      onClick={() => onChange(!checked)}
    />
  )
}

type SettingsPatch = Parameters<ReturnType<typeof useSettingsStore.getState>['set']>[0]
interface SectionProps {
  settings: ReturnType<typeof useSettingsStore.getState>['settings']
  setSettings: (patch: SettingsPatch) => void
}

function GeneralSection({ settings, setSettings }: SectionProps) {
  return (
    <div>
      <SectionTitle>General</SectionTitle>
      <Row label="Default opening view" description="Which view a document opens in">
        <select className="input select" style={{ width: 140 }} value={settings.defaultView} onChange={(e) => setSettings({ defaultView: e.target.value as DefaultView })}>
          <option value="edit">Edit</option>
          <option value="split">Split</option>
          <option value="preview">Preview</option>
        </select>
      </Row>
      <Row label="Auto-open last document" description="Resume your last document on launch">
        <Switch checked={settings.autoOpenLastDocument} onChange={(v) => setSettings({ autoOpenLastDocument: v })} />
      </Row>
      <Row label="Confirm before delete" description="Ask for confirmation on destructive actions">
        <Switch checked={settings.confirmDelete} onChange={(v) => setSettings({ confirmDelete: v })} />
      </Row>
      <Row label="Show breadcrumbs" description="Display folder path above documents">
        <Switch checked={settings.showBreadcrumbs} onChange={(v) => setSettings({ showBreadcrumbs: v })} />
      </Row>
    </div>
  )
}

function AppearanceSection({ settings, setSettings }: SectionProps) {
  return (
    <div>
      <SectionTitle>Appearance</SectionTitle>
      <Row label="Theme">
        <select className="input select" style={{ width: 140 }} value={settings.theme} onChange={(e) => setSettings({ theme: e.target.value as ThemeMode })}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </Row>
      <Row label="Accent color">
        <div className="flex gap-2">
          {ACCENTS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onClick={() => setSettings({ accentColor: c })}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: ACCENT_HEX[c],
                border: settings.accentColor === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                boxShadow: '0 0 0 1px var(--border-subtle)',
              }}
            />
          ))}
        </div>
      </Row>
      <Row label="Density" description="Adjust spacing throughout the interface">
        <select className="input select" style={{ width: 140 }} value={settings.density} onChange={(e) => setSettings({ density: e.target.value as Density })}>
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
        </select>
      </Row>
      <Row label="Show sidebar" description="Toggle the workspace sidebar">
        <Switch checked={settings.sidebarCollapsed === false} onChange={(v) => setSettings({ sidebarCollapsed: !v })} />
      </Row>
      <Row label="Show outline panel" description="Show the on-this-page outline for documents">
        <Switch checked={settings.showOutline} onChange={(v) => setSettings({ showOutline: v })} />
      </Row>
    </div>
  )
}

function EditorSection({ settings, setSettings }: SectionProps) {
  return (
    <div>
      <SectionTitle>Editor</SectionTitle>
      <Row label="Font size">
        <input type="number" className="input" style={{ width: 80 }} min={10} max={24} value={settings.editorFontSize} onChange={(e) => setSettings({ editorFontSize: Number(e.target.value) })} />
      </Row>
      <Row label="Line height">
        <input type="number" step={0.1} className="input" style={{ width: 80 }} min={1.2} max={2.4} value={settings.editorLineHeight} onChange={(e) => setSettings({ editorLineHeight: Number(e.target.value) })} />
      </Row>
      <Row label="Word wrap">
        <Switch checked={settings.editorWordWrap} onChange={(v) => setSettings({ editorWordWrap: v })} />
      </Row>
      <Row label="Minimap">
        <Switch checked={settings.editorMinimap} onChange={(v) => setSettings({ editorMinimap: v })} />
      </Row>
      <Row label="Line numbers">
        <Switch checked={settings.editorLineNumbers} onChange={(v) => setSettings({ editorLineNumbers: v })} />
      </Row>
    </div>
  )
}

function ReadingSection({ settings, setSettings, onReset }: SectionProps & { onReset: () => void }) {
  return (
    <div>
      <SectionTitle>Reading</SectionTitle>
      <Row label="Font family">
        <select className="input select" style={{ width: 140 }} value={settings.fontFamily} onChange={(e) => setSettings({ fontFamily: e.target.value as FontFamily })}>
          <option value="system">System</option>
          <option value="inter">Inter</option>
          <option value="serif">Serif</option>
          <option value="mono">Monospace</option>
        </select>
      </Row>
      <Row label="Font size">
        <div className="flex items-center gap-2">
          <input type="range" min={13} max={22} value={settings.fontSize} onChange={(e) => setSettings({ fontSize: Number(e.target.value) })} />
          <span className="text-[12px]" style={{ color: 'var(--text-tertiary)', width: 28 }}>
            {settings.fontSize}
          </span>
        </div>
      </Row>
      <Row label="Line height">
        <select className="input select" style={{ width: 140 }} value={settings.lineHeight} onChange={(e) => setSettings({ lineHeight: e.target.value as LineHeightPref })}>
          <option value="compact">Compact</option>
          <option value="comfortable">Comfortable</option>
          <option value="relaxed">Relaxed</option>
        </select>
      </Row>
      <Row label="Content width">
        <select className="input select" style={{ width: 140 }} value={settings.contentWidth} onChange={(e) => setSettings({ contentWidth: e.target.value as ContentWidth })}>
          <option value="narrow">Narrow</option>
          <option value="comfortable">Comfortable</option>
          <option value="wide">Wide</option>
        </select>
      </Row>
      <div style={{ paddingTop: 14 }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onReset}>
          Reset Reading Settings
        </button>
      </div>
    </div>
  )
}

function WorkspaceSection({ settings, setSettings }: SectionProps) {
  return (
    <div>
      <SectionTitle>Workspace</SectionTitle>
      <Row label="Auto-save" description="How quickly edits are saved automatically">
        <select className="input select" style={{ width: 140 }} value={settings.autoSave} onChange={(e) => setSettings({ autoSave: e.target.value as AutoSaveInterval })}>
          <option value="off">Off</option>
          <option value="1s">After 1 second</option>
          <option value="3s">After 3 seconds</option>
          <option value="5s">After 5 seconds</option>
        </select>
      </Row>
      <Row label="Restore tabs on launch">
        <Switch checked={settings.restoreTabs} onChange={(v) => setSettings({ restoreTabs: v })} />
      </Row>
      <Row label="Restore scroll position">
        <Switch checked={settings.restoreScrollPosition} onChange={(v) => setSettings({ restoreScrollPosition: v })} />
      </Row>

      <div style={{ paddingTop: 18 }}>
        <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Backup &amp; Restore
        </span>
        <div className="flex gap-2 mt-3 flex-wrap">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => downloadWorkspaceBackup().then(() => toast.success('Workspace exported'))}>
            Export Workspace
          </button>
          <ImportWorkspaceButton />
        </div>
      </div>
    </div>
  )
}

function ImportWorkspaceButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => inputRef.current?.click()}>
        Import Workspace
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          try {
            const backup = await parseBackupFile(file)
            const confirmed = await confirmDialog({
              title: 'Restore this backup?',
              message: 'This replaces your entire current workspace with the contents of this backup file. This cannot be undone.',
              confirmLabel: 'Restore Workspace',
              danger: true,
            })
            if (!confirmed) return
            await restoreWorkspace(backup)
            toast.success('Workspace restored. Reloading…')
            setTimeout(() => window.location.reload(), 900)
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Unable to import this backup file')
          }
        }}
      />
    </>
  )
}

function StorageSection() {
  const documents = useWorkspaceStore((s) => s.documents)
  const folders = useWorkspaceStore((s) => s.folders)
  const [estimate, setEstimate] = useState<{ usage: number; quota: number } | null>(null)
  const setSettings = useSettingsStore((s) => s.set)
  const settings = useSettingsStore((s) => s.settings)

  useEffect(() => {
    getStorageEstimate().then(setEstimate)
  }, [documents.length])

  return (
    <div>
      <SectionTitle>Storage</SectionTitle>
      <Row label="Documents">
        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          {documents.length}
        </span>
      </Row>
      <Row label="Folders">
        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          {folders.length}
        </span>
      </Row>
      <Row label="Storage used" description={estimate ? `of ${formatBytes(estimate.quota)} available` : undefined}>
        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          {estimate ? formatBytes(estimate.usage) : 'Unavailable'}
        </span>
      </Row>

      <div className="flex gap-2 mt-4 flex-wrap">
        {!settings.demoDataRemoved && documents.some((d) => d.isDemo) && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={async () => {
              const confirmed = await confirmDialog({ title: 'Remove demo data?', message: 'This deletes all documents and folders created as demo content.', confirmLabel: 'Remove Demo Data', danger: true })
              if (!confirmed) return
              const { deleteDocuments } = useWorkspaceStore.getState()
              const demoIds = documents.filter((d) => d.isDemo).map((d) => d.id)
              await deleteDocuments(demoIds)
              await setSettings({ demoDataRemoved: true })
            }}
          >
            Remove Demo Data
          </button>
        )}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={async () => {
            const confirmed = await confirmDialog({ title: 'Load demo workspace?', message: 'This adds sample documents and folders to your workspace.', confirmLabel: 'Load Demo Data' })
            if (!confirmed) return
            await seedDemoWorkspace()
            await useWorkspaceStore.getState().load()
            toast.success('Demo workspace loaded')
          }}
        >
          Load Demo Data
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={async () => {
            const confirmed = await confirmDialog({
              title: 'Clear entire workspace?',
              message: 'This permanently deletes every document, folder, tab and version in this browser. Export a backup first if you want to keep your data.',
              confirmLabel: 'Clear Everything',
              danger: true,
            })
            if (!confirmed) return
            await clearAllData()
            toast.success('Workspace cleared')
            setTimeout(() => window.location.reload(), 600)
          }}
        >
          Clear Workspace
        </button>
      </div>
    </div>
  )
}

const SHORTCUTS: [string, string][] = [
  ['⌘/Ctrl + K', 'Search'],
  ['⌘/Ctrl + Shift + P', 'Command Palette'],
  ['⌘/Ctrl + N', 'New Document'],
  ['⌘/Ctrl + O', 'Import Markdown'],
  ['⌘/Ctrl + S', 'Save'],
  ['⌘/Ctrl + F', 'Find'],
  ['⌘/Ctrl + H', 'Replace'],
  ['⌘/Ctrl + B', 'Bold (in editor)'],
  ['⌘/Ctrl + I', 'Italic (in editor)'],
  ['⌘/Ctrl + Shift + E', 'Toggle Edit / Split'],
  ['⌘/Ctrl + \\', 'Toggle Sidebar'],
  ['⌘/Ctrl + Shift + F', 'Focus Mode'],
  ['⌘/Ctrl + W', 'Close Tab'],
  ['⌘/Ctrl + Shift + T', 'Reopen Closed Tab'],
  ['Esc', 'Close modal / menu'],
]

function ShortcutsSection() {
  return (
    <div>
      <SectionTitle>Keyboard Shortcuts</SectionTitle>
      {SHORTCUTS.map(([combo, label]) => (
        <Row key={combo} label={label}>
          <span className="flex gap-1">
            {combo.split(' + ').map((k) => (
              <span key={k} className="kbd" style={{ minWidth: 'auto', padding: '2px 7px' }}>
                {k}
              </span>
            ))}
          </span>
        </Row>
      ))}
    </div>
  )
}

function AboutSection() {
  return (
    <div>
      <SectionTitle>About</SectionTitle>
      <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
        <strong>Markdown Workspace</strong> is a local-first documentation browser, editor, and library. It runs entirely as a
        static web application — there is no backend and no account.
      </p>
      <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
        Your documents are stored locally in this browser using IndexedDB. Nothing is uploaded to a server unless a future
        integration explicitly provides one. Clearing your browser's site data will remove everything — export a workspace
        backup regularly to protect your work.
      </p>
      <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Version 1.0.0</p>
    </div>
  )
}
