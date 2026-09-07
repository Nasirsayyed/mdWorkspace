import { useCallback } from 'react'
import { useImportFiles } from './useImportFiles'
import type { ID } from '@/types'

function pickFiles(opts: { directory?: boolean; multiple?: boolean }): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.mdx,.txt'
    if (opts.multiple !== false) input.multiple = true
    if (opts.directory) {
      input.setAttribute('webkitdirectory', 'true')
      input.setAttribute('directory', 'true')
    }
    input.style.display = 'none'
    document.body.appendChild(input)
    input.addEventListener('change', () => {
      resolve(input.files)
      document.body.removeChild(input)
    })
    input.addEventListener('cancel', () => {
      resolve(null)
      document.body.removeChild(input)
    })
    input.click()
  })
}

export function useFilePicker() {
  const importFiles = useImportFiles()

  const openFilePicker = useCallback(
    async (folderId: ID | null = null) => {
      const files = await pickFiles({ directory: false })
      if (files && files.length > 0) await importFiles(files, folderId)
    },
    [importFiles],
  )

  const openFolderPicker = useCallback(
    async (folderId: ID | null = null) => {
      const files = await pickFiles({ directory: true })
      if (files && files.length > 0) await importFiles(files, folderId)
    },
    [importFiles],
  )

  return { openFilePicker, openFolderPicker }
}
