import { useUIStore } from '@/state/uiStore'
import { ConfirmDialog } from './ConfirmDialog'
import { NewDocumentDialog } from './NewDocumentDialog'
import { NewFolderDialog } from './NewFolderDialog'
import { RenameFolderDialog } from './RenameFolderDialog'
import { MoveDocumentDialog } from './MoveDocumentDialog'
import { VersionHistoryDialog } from './VersionHistoryDialog'
import { DocumentInfoDialog } from './DocumentInfoDialog'
import { ImportDuplicateDialog } from './ImportDuplicateDialog'

export function DialogHost() {
  const dialog = useUIStore((s) => s.dialog)
  if (!dialog) return null

  switch (dialog.type) {
    case 'confirm':
      return <ConfirmDialog dialog={dialog} />
    case 'newDocument':
      return <NewDocumentDialog dialog={dialog} />
    case 'newFolder':
      return <NewFolderDialog dialog={dialog} />
    case 'renameFolder':
      return <RenameFolderDialog dialog={dialog} />
    case 'moveDocument':
      return <MoveDocumentDialog dialog={dialog} />
    case 'versionHistory':
      return <VersionHistoryDialog dialog={dialog} />
    case 'documentInfo':
      return <DocumentInfoDialog dialog={dialog} />
    case 'importDuplicate':
      return <ImportDuplicateDialog dialog={dialog} />
    default:
      return null
  }
}
