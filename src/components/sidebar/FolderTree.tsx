import { useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronRight, MoreHorizontal, FolderPlus, Pencil, Trash2 } from 'lucide-react'
import type { Folder, ID } from '@/types'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useUIStore, confirmDialog } from '@/state/uiStore'
import { Menu, MenuItem, MenuSeparator } from '@/components/common/Menu'
import { folderColorValue } from '@/utils/folderColor'
import clsx from 'clsx'

interface TreeNode extends Folder {
  children: TreeNode[]
}

function buildTree(folders: Folder[]): TreeNode[] {
  const map = new Map<ID, TreeNode>(folders.map((f) => [f.id, { ...f, children: [] }]))
  const roots: TreeNode[] = []
  for (const folder of folders) {
    const node = map.get(folder.id)!
    if (folder.parentId && map.has(folder.parentId)) {
      map.get(folder.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  const sortRec = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    nodes.forEach((n) => sortRec(n.children))
  }
  sortRec(roots)
  return roots
}

export function FolderTree() {
  const folders = useWorkspaceStore((s) => s.folders)
  const tree = buildTree(folders)

  if (tree.length === 0) {
    return <div className="text-[12px] px-2.5 py-2" style={{ color: 'var(--text-tertiary)' }}>No folders yet</div>
  }

  return (
    <div>
      {tree.map((node) => (
        <FolderNode key={node.id} node={node} depth={0} />
      ))}
    </div>
  )
}

function FolderNode({ node, depth }: { node: TreeNode; depth: number }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [expanded, setExpanded] = useState(true)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const documents = useWorkspaceStore((s) => s.documents)
  const moveDocument = useWorkspaceStore((s) => s.moveDocument)
  const moveFolder = useWorkspaceStore((s) => s.moveFolder)
  const deleteFolder = useWorkspaceStore((s) => s.deleteFolder)
  const openDialog = useUIStore((s) => s.openDialog)
  const btnRef = useRef<HTMLButtonElement>(null)

  const count = documents.filter((d) => d.folderId === node.id).length
  const active = location.pathname === `/folder/${node.id}`

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const docId = e.dataTransfer.getData('application/x-document-id')
    const folderId = e.dataTransfer.getData('application/x-folder-id')
    if (docId) await moveDocument(docId, node.id)
    else if (folderId && folderId !== node.id) await moveFolder(folderId, node.id)
  }

  return (
    <div className="folder-row">
      <div
        className={clsx('nav-item', active && 'active', dragOver && 'drop-target')}
        draggable
        onDragStart={(e) => e.dataTransfer.setData('application/x-folder-id', node.id)}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => navigate(`/folder/${node.id}`)}
        style={{ paddingLeft: 10 + depth * 14 }}
      >
        {node.children.length > 0 ? (
          <span
            className="nav-icon"
            onClick={(e) => {
              e.stopPropagation()
              setExpanded((v) => !v)
            }}
          >
            <ChevronRight size={12} style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 120ms' }} />
          </span>
        ) : (
          <span className="nav-icon" />
        )}
        <span className="nav-icon" style={{ color: folderColorValue(node.color) }}>
          {node.icon ?? '📁'}
        </span>
        <span className="nav-label">{node.name}</span>
        {count > 0 && <span className="nav-count">{count}</span>}
        <button
          type="button"
          ref={btnRef}
          className="btn-icon btn-ghost"
          style={{ width: 22, height: 22 }}
          onClick={(e) => {
            e.stopPropagation()
            const rect = btnRef.current?.getBoundingClientRect()
            setMenuPos(rect ? { x: rect.left, y: rect.bottom + 4 } : { x: e.clientX, y: e.clientY })
          }}
          aria-label={`${node.name} options`}
        >
          <MoreHorizontal size={13} />
        </button>
      </div>

      {menuPos && (
        <Menu x={menuPos.x} y={menuPos.y} onClose={() => setMenuPos(null)}>
          <MenuItem icon={<FolderPlus size={14} />} onSelect={() => { openDialog({ type: 'newFolder', parentId: node.id }); setMenuPos(null) }}>
            New Subfolder
          </MenuItem>
          <MenuItem icon={<Pencil size={14} />} onSelect={() => { openDialog({ type: 'renameFolder', folderId: node.id }); setMenuPos(null) }}>
            Rename / Edit
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            icon={<Trash2 size={14} />}
            danger
            onSelect={async () => {
              setMenuPos(null)
              const confirmed = await confirmDialog({
                title: `Delete "${node.name}"?`,
                message: 'Documents inside this folder will move to All Documents. Subfolders will also be removed.',
                confirmLabel: 'Delete Folder',
                danger: true,
              })
              if (confirmed) {
                await deleteFolder(node.id)
                if (active) navigate('/documents')
              }
            }}
          >
            Delete Folder
          </MenuItem>
        </Menu>
      )}

      {expanded && node.children.length > 0 && (
        <div className="folder-children">
          {node.children.map((child) => (
            <FolderNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
