import { createFolder } from '@/storage/folders'
import { createDocument, updateDocument } from '@/storage/documents'
import { demoContent } from './demoContent'

export async function seedDemoWorkspace(): Promise<void> {
  const docsFolder = await createFolder({ name: 'Documentation', color: 'indigo', icon: '📁' })
  const guides = await createFolder({ name: 'Guides', parentId: docsFolder.id, color: 'blue', icon: '📘' })
  const architecture = await createFolder({ name: 'Architecture', parentId: docsFolder.id, color: 'violet', icon: '🏗' })
  const projects = await createFolder({ name: 'Projects', color: 'teal', icon: '📁' })
  const wms = await createFolder({ name: 'WMS', parentId: projects.id, color: 'green', icon: '📦' })
  const api = await createFolder({ name: 'API', parentId: projects.id, color: 'amber', icon: '🔌' })
  const mobile = await createFolder({ name: 'Mobile', parentId: projects.id, color: 'rose', icon: '📱' })

  const entries: Array<{ name: string; content: string; folderId: string | null; tags: string[]; favorite?: boolean; pinned?: boolean }> = [
    { name: 'README.md', content: demoContent.readme, folderId: null, tags: ['documentation', 'overview'], favorite: true, pinned: true },
    { name: 'Getting Started.md', content: demoContent.gettingStarted, folderId: guides.id, tags: ['guide'] },
    { name: 'Architecture.md', content: demoContent.architecture, folderId: architecture.id, tags: ['architecture', 'important'] },
    { name: 'API Reference.md', content: demoContent.apiReference, folderId: api.id, tags: ['api', 'reference'] },
    { name: 'WMS Operations.md', content: demoContent.wmsOperations, folderId: wms.id, tags: ['wms', 'operations'], favorite: true },
    { name: 'Mobile Application.md', content: demoContent.mobileApp, folderId: mobile.id, tags: ['mobile'] },
    { name: 'Deployment Guide.md', content: demoContent.deploymentGuide, folderId: guides.id, tags: ['deployment', 'guide'] },
    { name: 'Troubleshooting.md', content: demoContent.troubleshooting, folderId: guides.id, tags: ['support'] },
  ]

  for (const entry of entries) {
    const doc = await createDocument({ name: entry.name, content: entry.content, folderId: entry.folderId, tags: entry.tags, isDemo: true })
    if (entry.favorite || entry.pinned) {
      await updateDocument(doc.id, { isFavorite: !!entry.favorite, isPinned: !!entry.pinned }, { touch: false })
    }
  }
}
