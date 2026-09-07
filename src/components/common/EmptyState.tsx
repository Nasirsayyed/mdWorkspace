import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  actions?: ReactNode
}

export function EmptyState({ icon, title, description, actions }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16 gap-3" style={{ color: 'var(--text-secondary)' }}>
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 56, height: 56, background: 'var(--bg-sunken)', color: 'var(--text-tertiary)' }}
      >
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      {description && <p className="text-[13px] max-w-sm leading-relaxed">{description}</p>}
      {actions && <div className="flex items-center gap-2 mt-2">{actions}</div>}
    </div>
  )
}
