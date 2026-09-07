import { saveAs } from 'file-saver'
import type { MDDocument } from '@/types'
import { markdownToStandaloneHtml } from '@/services/markdown'

export function downloadMarkdown(doc: MDDocument): void {
  const blob = new Blob([doc.content], { type: 'text/markdown;charset=utf-8' })
  saveAs(blob, doc.name.endsWith('.md') ? doc.name : `${doc.name}.md`)
}

export function downloadHtml(doc: MDDocument): void {
  const html = markdownToStandaloneHtml(doc.content, doc.name.replace(/\.mdx?$/i, ''))
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  saveAs(blob, `${doc.name.replace(/\.mdx?$/i, '')}.html`)
}

export function printDocument(doc: MDDocument): void {
  document.title = doc.name
  window.print()
}
