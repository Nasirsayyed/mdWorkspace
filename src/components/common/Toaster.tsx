import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore } from '@/state/toastStore'
import { Portal } from './Portal'

const icons = {
  success: <CheckCircle2 size={16} color="var(--success)" />,
  error: <AlertTriangle size={16} color="var(--danger)" />,
  info: <Info size={16} color="var(--accent)" />,
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  if (toasts.length === 0) return null

  return (
    <Portal>
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {icons[t.type]}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button type="button" className="btn-icon btn-ghost" style={{ height: 22, width: 22 }} onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </Portal>
  )
}
