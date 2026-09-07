import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FolderInput, FilePlus, Sparkles, X } from 'lucide-react'
import { useSettingsStore } from '@/state/settingsStore'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useTabsStore } from '@/state/tabsStore'
import { useImportFiles } from '@/hooks/useImportFiles'
import { seedDemoWorkspace } from '@/data/seedDemoWorkspace'
import { toast } from '@/state/toastStore'

function pickFiles(directory: boolean): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.mdx,.txt'
    input.multiple = true
    if (directory) {
      input.setAttribute('webkitdirectory', 'true')
      input.setAttribute('directory', 'true')
    }
    input.style.display = 'none'
    document.body.appendChild(input)
    input.addEventListener('change', () => {
      resolve(input.files)
      document.body.removeChild(input)
    })
    input.click()
  })
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const setSettings = useSettingsStore((s) => s.set)
  const createDocument = useWorkspaceStore((s) => s.createDocument)
  const loadWorkspace = useWorkspaceStore((s) => s.load)
  const openDocument = useTabsStore((s) => s.openDocument)
  const importFiles = useImportFiles()
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)

  const complete = async () => {
    await setSettings({ onboardingComplete: true })
  }

  const finishWithImport = async (files: FileList) => {
    setBusy(true)
    await importFiles(files, null)
    await complete()
    setBusy(false)
    navigate('/documents')
  }

  useEffect(() => {
    function onDragOver(e: DragEvent) {
      if (Array.from(e.dataTransfer?.types ?? []).includes('Files')) e.preventDefault()
    }
    function onDragEnter(e: DragEvent) {
      if (Array.from(e.dataTransfer?.types ?? []).includes('Files')) setDragging(true)
    }
    function onDragLeave() {
      setDragging(false)
    }
    async function onDrop(e: DragEvent) {
      e.preventDefault()
      setDragging(false)
      const files = e.dataTransfer?.files
      if (files && files.length > 0) await finishWithImport(files)
    }
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [])

  const handleImportFiles = async () => {
    const files = await pickFiles(false)
    if (files && files.length > 0) await finishWithImport(files)
  }

  const handleImportFolder = async () => {
    const files = await pickFiles(true)
    if (files && files.length > 0) await finishWithImport(files)
  }

  const handleCreateBlank = async () => {
    setBusy(true)
    const doc = await createDocument({ name: 'Untitled Document.md', content: '# Untitled Document\n\n' })
    await openDocument(doc.id)
    await complete()
    setBusy(false)
    navigate(`/document/${doc.id}`)
  }

  const handleDemoWorkspace = async () => {
    setBusy(true)
    await seedDemoWorkspace()
    await loadWorkspace()
    await complete()
    setBusy(false)
    toast.success('Demo workspace loaded')
    navigate('/')
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{
        height: '100dvh',
        background: 'radial-gradient(circle at 50% 0%, var(--accent-soft), var(--bg-canvas) 55%)',
        position: 'relative',
      }}
    >
      <button type="button" className="btn btn-ghost btn-sm" style={{ position: 'absolute', top: 20, right: 20 }} onClick={complete} disabled={busy}>
        Skip <X size={13} />
      </button>

      <div className="flex flex-col items-center text-center gap-2" style={{ maxWidth: 520, padding: 24 }}>
        <div
          className="flex items-center justify-center rounded-2xl mb-2"
          style={{ width: 56, height: 56, background: 'var(--accent)', color: 'white', fontSize: 24, boxShadow: 'var(--shadow-lg)' }}
        >
          ◈
        </div>
        <h1 className="text-[26px] font-bold" style={{ color: 'var(--text-primary)' }}>
          Markdown Workspace
        </h1>
        <p className="text-[14.5px]" style={{ color: 'var(--text-secondary)' }}>
          Your documentation. Your browser.
        </p>
        <p className="text-[13px] mb-6" style={{ color: 'var(--text-tertiary)', maxWidth: 380 }}>
          Upload and organize your Markdown — everything is stored locally in this browser. Nothing is ever uploaded anywhere.
        </p>

        <div className="grid gap-2.5" style={{ width: '100%', gridTemplateColumns: '1fr 1fr' }}>
          <button type="button" className="btn btn-primary" style={{ height: 42 }} onClick={handleImportFiles} disabled={busy}>
            <Upload size={15} /> Import Markdown
          </button>
          <button type="button" className="btn btn-secondary" style={{ height: 42 }} onClick={handleImportFolder} disabled={busy}>
            <FolderInput size={15} /> Import Folder
          </button>
          <button type="button" className="btn btn-secondary" style={{ height: 42 }} onClick={handleCreateBlank} disabled={busy}>
            <FilePlus size={15} /> Create Blank Document
          </button>
          <button type="button" className="btn btn-secondary" style={{ height: 42 }} onClick={handleDemoWorkspace} disabled={busy}>
            <Sparkles size={15} /> Continue Demo Workspace
          </button>
        </div>

        <p className="text-[12px] mt-6" style={{ color: 'var(--text-tertiary)' }}>
          {dragging ? 'Drop your files anywhere to import' : 'or drag files anywhere'}
        </p>
      </div>
    </div>
  )
}
