import { useEffect, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { useImportFiles } from '@/hooks/useImportFiles'
import { useUIStore } from '@/state/uiStore'

export function GlobalDropZone() {
  const [dragging, setDragging] = useState(false)
  const importFiles = useImportFiles()
  const activeFolderId = useUIStore((s) => s.activeFolderId)

  useEffect(() => {
    let counter = 0

    function hasFiles(e: DragEvent) {
      return Array.from(e.dataTransfer?.types ?? []).includes('Files')
    }

    function onDragEnter(e: DragEvent) {
      if (!hasFiles(e)) return
      counter++
      setDragging(true)
    }
    function onDragOver(e: DragEvent) {
      if (!hasFiles(e)) return
      e.preventDefault()
    }
    function onDragLeave(e: DragEvent) {
      if (!hasFiles(e)) return
      counter = Math.max(0, counter - 1)
      if (counter === 0) setDragging(false)
    }
    async function onDrop(e: DragEvent) {
      if (!hasFiles(e)) return
      e.preventDefault()
      counter = 0
      setDragging(false)
      const files = e.dataTransfer?.files
      if (files && files.length > 0) await importFiles(files, activeFolderId)
    }

    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [importFiles, activeFolderId])

  if (!dragging) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'color-mix(in srgb, var(--accent) 10%, var(--bg-overlay))',
        border: '3px dashed var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div className="flex flex-col items-center gap-3" style={{ color: 'var(--text-on-accent)' }}>
        <div className="flex items-center justify-center rounded-2xl" style={{ width: 64, height: 64, background: 'var(--accent)' }}>
          <UploadCloud size={28} />
        </div>
        <p className="text-[16px] font-semibold" style={{ color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
          Drop Markdown files to import
        </p>
      </div>
    </div>
  )
}
