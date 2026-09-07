import { create } from 'zustand'
import type { MDDocument, Folder, ID } from '@/types'
import * as documents from '@/storage/documents'
import * as folders from '@/storage/folders'
import * as trash from '@/storage/trash'
import * as versions from '@/storage/versions'
import { toast } from '@/state/toastStore'
import { describeStorageError, isQuotaError } from '@/utils/errors'

interface WorkspaceState {
  documents: MDDocument[]
  folders: Folder[]
  trashItems: MDDocument[]
  loaded: boolean

  load: () => Promise<void>
  refreshDocuments: () => Promise<void>
  refreshFolders: () => Promise<void>
  refreshTrash: () => Promise<void>

  createDocument: (input: documents.CreateDocumentInput) => Promise<MDDocument>
  updateDocument: (
    id: ID,
    changes: Partial<Pick<MDDocument, 'name' | 'content' | 'folderId' | 'tags' | 'isFavorite' | 'isPinned' | 'readingProgress'>>,
    options?: { snapshot?: boolean; touch?: boolean; silent?: boolean },
  ) => Promise<void>
  touchOpened: (id: ID) => Promise<void>
  toggleFavorite: (id: ID) => Promise<void>
  togglePinned: (id: ID) => Promise<void>
  renameDocument: (id: ID, name: string) => Promise<void>
  duplicateDocument: (id: ID) => Promise<MDDocument | undefined>
  moveDocument: (id: ID, folderId: ID | null) => Promise<void>
  deleteDocument: (id: ID) => Promise<void>
  deleteDocuments: (ids: ID[]) => Promise<void>
  restoreDocument: (id: ID) => Promise<MDDocument | undefined>
  permanentlyDelete: (id: ID) => Promise<void>
  emptyTrash: () => Promise<void>

  createFolder: (input: folders.CreateFolderInput) => Promise<Folder>
  renameFolder: (id: ID, name: string) => Promise<void>
  updateFolder: (id: ID, changes: Partial<Pick<Folder, 'name' | 'color' | 'icon' | 'parentId'>>) => Promise<void>
  moveFolder: (id: ID, parentId: ID | null) => Promise<void>
  deleteFolder: (id: ID) => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  documents: [],
  folders: [],
  trashItems: [],
  loaded: false,

  load: async () => {
    const [docs, flds, trashed] = await Promise.all([documents.listDocuments(), folders.listFolders(), trash.listTrash()])
    set({ documents: docs, folders: flds, trashItems: trashed, loaded: true })
  },
  refreshDocuments: async () => set({ documents: await documents.listDocuments() }),
  refreshFolders: async () => set({ folders: await folders.listFolders() }),
  refreshTrash: async () => set({ trashItems: await trash.listTrash() }),

  createDocument: async (input) => {
    try {
      const doc = await documents.createDocument(input)
      set((s) => ({ documents: [...s.documents, doc] }))
      return doc
    } catch (err) {
      toast.error(isQuotaError(err) ? 'Storage limit reached. Free up space or export your workspace before adding more documents.' : 'Unable to create document.')
      throw err
    }
  },

  updateDocument: async (id, changes, options = {}) => {
    try {
      const next = await documents.updateDocument(id, changes, options)
      if (!next) return
      set((s) => ({ documents: s.documents.map((d) => (d.id === id ? next : d)) }))
    } catch (err) {
      toast.error(describeStorageError(err))
    }
  },

  touchOpened: async (id) => {
    await documents.touchOpened(id)
    set((s) => ({
      documents: s.documents.map((d) => (d.id === id ? { ...d, lastOpenedAt: Date.now() } : d)),
    }))
  },

  toggleFavorite: async (id) => {
    const doc = get().documents.find((d) => d.id === id)
    if (!doc) return
    await get().updateDocument(id, { isFavorite: !doc.isFavorite }, { touch: false })
    toast.success(doc.isFavorite ? 'Removed from favorites' : 'Added to favorites')
  },

  togglePinned: async (id) => {
    const doc = get().documents.find((d) => d.id === id)
    if (!doc) return
    await get().updateDocument(id, { isPinned: !doc.isPinned }, { touch: false })
    toast.success(doc.isPinned ? 'Unpinned' : 'Pinned')
  },

  renameDocument: async (id, name) => {
    await documents.renameDocument(id, name)
    set((s) => ({ documents: s.documents.map((d) => (d.id === id ? { ...d, name, updatedAt: Date.now() } : d)) }))
    toast.success('Document renamed')
  },

  duplicateDocument: async (id) => {
    const copy = await documents.duplicateDocument(id)
    if (copy) {
      set((s) => ({ documents: [...s.documents, copy] }))
      toast.success(`Duplicated as "${copy.name}"`)
    }
    return copy
  },

  moveDocument: async (id, folderId) => {
    await documents.moveDocumentToFolder(id, folderId)
    set((s) => ({ documents: s.documents.map((d) => (d.id === id ? { ...d, folderId, updatedAt: Date.now() } : d)) }))
    const folderName = folderId ? get().folders.find((f) => f.id === folderId)?.name : 'All Documents'
    toast.success(`Moved to ${folderName ?? 'root'}`)
  },

  deleteDocument: async (id) => {
    const doc = get().documents.find((d) => d.id === id)
    await documents.softDeleteDocument(id)
    set((s) => ({
      documents: s.documents.filter((d) => d.id !== id),
      trashItems: doc ? [{ ...doc, deletedAt: Date.now() }, ...s.trashItems] : s.trashItems,
    }))
    toast.success('Moved to Trash')
  },

  deleteDocuments: async (ids) => {
    const removed = get().documents.filter((d) => ids.includes(d.id))
    await documents.softDeleteMany(ids)
    set((s) => ({
      documents: s.documents.filter((d) => !ids.includes(d.id)),
      trashItems: [...removed.map((d) => ({ ...d, deletedAt: Date.now() })), ...s.trashItems],
    }))
    toast.success(`${ids.length} documents moved to Trash`)
  },

  restoreDocument: async (id) => {
    const restored = await trash.restoreFromTrash(id)
    if (restored) {
      set((s) => ({
        trashItems: s.trashItems.filter((d) => d.id !== id),
        documents: [...s.documents, restored],
      }))
      toast.success(`Restored "${restored.name}"`)
    }
    return restored
  },

  permanentlyDelete: async (id) => {
    await trash.deletePermanently(id)
    await versions.deleteVersionsForDocument(id)
    set((s) => ({ trashItems: s.trashItems.filter((d) => d.id !== id) }))
    toast.success('Document permanently deleted')
  },

  emptyTrash: async () => {
    const ids = get().trashItems.map((d) => d.id)
    await trash.emptyTrash()
    await Promise.all(ids.map((id) => versions.deleteVersionsForDocument(id)))
    set({ trashItems: [] })
    toast.success('Trash emptied')
  },

  createFolder: async (input) => {
    try {
      const folder = await folders.createFolder(input)
      set((s) => ({ folders: [...s.folders, folder] }))
      toast.success(`Folder "${folder.name}" created`)
      return folder
    } catch (err) {
      toast.error(describeStorageError(err))
      throw err
    }
  },

  renameFolder: async (id, name) => {
    await folders.renameFolder(id, name)
    set((s) => ({ folders: s.folders.map((f) => (f.id === id ? { ...f, name, updatedAt: Date.now() } : f)) }))
  },

  updateFolder: async (id, changes) => {
    await folders.updateFolder(id, changes)
    set((s) => ({ folders: s.folders.map((f) => (f.id === id ? { ...f, ...changes, updatedAt: Date.now() } : f)) }))
  },

  moveFolder: async (id, parentId) => {
    await folders.moveFolder(id, parentId)
    set((s) => ({ folders: s.folders.map((f) => (f.id === id ? { ...f, parentId, updatedAt: Date.now() } : f)) }))
  },

  deleteFolder: async (id) => {
    await folders.deleteFolder(id, null)
    await get().refreshFolders()
    await get().refreshDocuments()
    toast.success('Folder deleted')
  },
}))
