export interface ParsedFile {
  name: string
  content: string
  relativePath: string | null
  error?: string
}

const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8MB
const ALLOWED_EXTENSIONS = /\.(md|markdown|mdx|txt)$/i

export function isMarkdownFile(file: File): boolean {
  return ALLOWED_EXTENSIONS.test(file.name)
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || null

  if (!isMarkdownFile(file)) {
    return { name: file.name, content: '', relativePath, error: 'Unsupported file type' }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { name: file.name, content: '', relativePath, error: 'File exceeds 8MB limit' }
  }
  try {
    const content = await file.text()
    return { name: file.name, content, relativePath }
  } catch {
    return { name: file.name, content: '', relativePath, error: 'Unable to read file' }
  }
}

export async function parseFiles(files: FileList | File[]): Promise<ParsedFile[]> {
  const list = Array.from(files)
  return Promise.all(list.map(parseFile))
}

export function extractFolderPath(relativePath: string | null): string[] {
  if (!relativePath) return []
  const parts = relativePath.split('/')
  parts.pop()
  return parts.filter(Boolean)
}
