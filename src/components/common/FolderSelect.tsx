import { useWorkspaceStore } from '@/state/workspaceStore'
import type { ID, Folder } from '@/types'

function buildOptions(folders: Folder[]): { id: ID; label: string }[] {
  const byParent = new Map<ID | null, Folder[]>()
  for (const f of folders) {
    const list = byParent.get(f.parentId) ?? []
    list.push(f)
    byParent.set(f.parentId, list)
  }
  const options: { id: ID; label: string }[] = []
  function walk(parentId: ID | null, depth: number) {
    const children = (byParent.get(parentId) ?? []).sort((a, b) => a.name.localeCompare(b.name))
    for (const child of children) {
      options.push({ id: child.id, label: `${'  '.repeat(depth)}${depth > 0 ? '↳ ' : ''}${child.name}` })
      walk(child.id, depth + 1)
    }
  }
  walk(null, 0)
  return options
}

interface FolderSelectProps {
  value: string | null
  onChange: (id: string | null) => void
  excludeId?: string
}

export function FolderSelect({ value, onChange, excludeId }: FolderSelectProps) {
  const folders = useWorkspaceStore((s) => s.folders)
  const options = buildOptions(folders).filter((o) => o.id !== excludeId)

  return (
    <select
      className="input select"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
    >
      <option value="">All Documents (no folder)</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
