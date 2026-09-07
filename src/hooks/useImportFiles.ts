import { useCallback } from 'react'
import { useWorkspaceStore } from '@/state/workspaceStore'
import { useUIStore } from '@/state/uiStore'
import { toast } from '@/state/toastStore'
import { parseFiles, extractFolderPath, type ParsedFile } from '@/services/import'
import { findByName } from '@/storage/documents'
import { titleFromFilename } from '@/utils/text'
import type { ID } from '@/types'

export function useImportFiles() {
  const createDocument = useWorkspaceStore((s) => s.createDocument)
  const createFolder = useWorkspaceStore((s) => s.createFolder)
  const openDialog = useUIStore((s) => s.openDialog)

  return useCallback(
    async (files: FileList | File[], targetFolderId: ID | null = null): Promise<{ imported: number; skipped: number; errors: number }> => {
      const parsed = await parseFiles(files)
      let imported = 0
      let skipped = 0
      let errors = 0

      const folderCache = new Map<string, ID>()
      for (const f of useWorkspaceStore.getState().folders) {
        folderCache.set(`${f.parentId ?? 'root'}/${f.name}`, f.id)
      }

      async function resolveFolderPath(pathParts: string[]): Promise<ID | null> {
        let parentId: ID | null = targetFolderId
        for (const part of pathParts) {
          const key = `${parentId ?? 'root'}/${part}`
          let id = folderCache.get(key)
          if (!id) {
            const folder = await createFolder({ name: part, parentId })
            id = folder.id
            folderCache.set(key, id)
          }
          parentId = id
        }
        return parentId
      }

      for (const file of parsed) {
        if (file.error) {
          errors++
          toast.error(`${file.name}: ${file.error}`)
          continue
        }

        const pathParts = extractFolderPath(file.relativePath)
        const folderId = pathParts.length > 0 ? await resolveFolderPath(pathParts) : targetFolderId

        const existing = await findByName(file.name, folderId)
        let finalName = file.name
        let action: 'replace' | 'keep' | 'cancel' = 'keep'

        if (existing) {
          action = await new Promise<'replace' | 'keep' | 'cancel'>((resolve) => {
            openDialog({ type: 'importDuplicate', fileName: file.name, onResolve: resolve })
          })
          if (action === 'cancel') {
            skipped++
            continue
          }
          if (action === 'replace') {
            await useWorkspaceStore.getState().updateDocument(existing.id, { content: file.content }, { snapshot: true })
            imported++
            continue
          }
          finalName = nextAvailableName(file.name)
        }

        await createDocument({ name: finalName, content: file.content, folderId, tags: [] })
        imported++
      }

      if (imported > 0) toast.success(`${imported} document${imported === 1 ? '' : 's'} imported`)
      if (errors > 0) toast.error(`${errors} file${errors === 1 ? '' : 's'} could not be imported`)

      return { imported, skipped, errors }
    },
    [createDocument, createFolder, openDialog],
  )
}

function nextAvailableName(name: string): string {
  const match = name.match(/^(.*?)(\.mdx?)$/i)
  const base = match ? match[1] : name
  const ext = match ? match[2] : ''
  return `${titleFromFilename(base)} (${Date.now().toString(36).slice(-4)})${ext}`
}

export type { ParsedFile }
