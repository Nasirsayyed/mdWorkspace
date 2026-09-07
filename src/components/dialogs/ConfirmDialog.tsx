import { DialogShell } from './DialogShell'
import { useUIStore, type DialogState } from '@/state/uiStore'

export function ConfirmDialog({ dialog }: { dialog: Extract<DialogState, { type: 'confirm' }> }) {
  const closeDialog = useUIStore((s) => s.closeDialog)

  return (
    <DialogShell
      title={dialog.title}
      onClose={closeDialog}
      width={400}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={closeDialog}>
            {dialog.cancelLabel ?? 'Cancel'}
          </button>
          <button
            type="button"
            className={dialog.danger ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={() => {
              dialog.onConfirm()
              closeDialog()
            }}
          >
            {dialog.confirmLabel ?? 'Confirm'}
          </button>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {dialog.message}
      </p>
    </DialogShell>
  )
}
