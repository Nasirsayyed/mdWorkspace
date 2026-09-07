import { useState } from 'react'
import { DialogShell } from './DialogShell'
import { useUIStore, type DialogState } from '@/state/uiStore'

export function ImportDuplicateDialog({ dialog }: { dialog: Extract<DialogState, { type: 'importDuplicate' }> }) {
  const closeDialog = useUIStore((s) => s.closeDialog)
  const [choice, setChoice] = useState<'replace' | 'keep' | 'cancel'>('keep')

  const resolve = (action: 'replace' | 'keep' | 'cancel') => {
    dialog.onResolve(action)
    closeDialog()
  }

  return (
    <DialogShell
      title={`"${dialog.fileName}" already exists`}
      onClose={() => resolve('cancel')}
      width={400}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={() => resolve('cancel')}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => resolve(choice)}>
            Continue
          </button>
        </>
      }
    >
      <p className="text-[13px] mb-3" style={{ color: 'var(--text-secondary)' }}>
        What would you like to do?
      </p>
      <div className="flex flex-col gap-2">
        {(
          [
            ['replace', 'Replace existing'],
            ['keep', 'Keep both'],
            ['cancel', 'Skip this file'],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2.5 text-[13px] cursor-pointer" style={{ color: 'var(--text-primary)' }}>
            <input type="radio" name="dup" checked={choice === value} onChange={() => setChoice(value)} />
            {label}
          </label>
        ))}
      </div>
    </DialogShell>
  )
}
