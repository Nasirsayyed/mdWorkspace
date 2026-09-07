import { useState } from 'react'
import { DialogShell } from './DialogShell'
import { useUIStore, type DialogState } from '@/state/uiStore'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { FOLDER_COLORS as COLORS, FOLDER_ICONS as ICONS, folderColorValue } from '@/utils/folderColor'

export function RenameFolderDialog({ dialog }: { dialog: Extract<DialogState, { type: 'renameFolder' }> }) {
  const closeDialog = useUIStore((s) => s.closeDialog)
  const folder = useWorkspaceStore((s) => s.folders.find((f) => f.id === dialog.folderId))
  const updateFolder = useWorkspaceStore((s) => s.updateFolder)

  const [name, setName] = useState(folder?.name ?? '')
  const [color, setColor] = useState(folder?.color ?? COLORS[0])
  const [icon, setIcon] = useState(folder?.icon ?? ICONS[0])

  if (!folder) return null

  const handleSave = async () => {
    if (!name.trim()) return
    await updateFolder(folder.id, { name: name.trim(), color, icon })
    closeDialog()
  }

  return (
    <DialogShell
      title="Edit Folder"
      onClose={closeDialog}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={closeDialog}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={!name.trim()} onClick={handleSave}>
            Save
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Folder name
          </span>
          <input
            className="input"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Icon
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ICONS.map((i) => (
              <button
                type="button"
                key={i}
                onClick={() => setIcon(i)}
                className="btn-icon"
                style={{
                  border: `1.5px solid ${icon === i ? 'var(--accent)' : 'var(--border-default)'}`,
                  background: icon === i ? 'var(--bg-selected)' : 'transparent',
                  fontSize: 15,
                }}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Color
          </span>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                aria-label={c}
                onClick={() => setColor(c)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: folderColorValue(c),
                  border: color === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                  boxShadow: '0 0 0 1px var(--border-subtle)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </DialogShell>
  )
}
