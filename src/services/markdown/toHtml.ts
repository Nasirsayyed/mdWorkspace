import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import { markdownSanitizeSchema } from './sanitizeSchema'

export function markdownToHtmlFragment(content: string): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'append', properties: { className: ['heading-anchor'] } })
    .use(rehypeHighlight)
    .use(rehypeSanitize, markdownSanitizeSchema)
    .use(rehypeStringify)
    .processSync(content)
  return String(file)
}

export function markdownToStandaloneHtml(content: string, title: string): string {
  const fragment = markdownToHtmlFragment(content)
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif; max-width: 760px; margin: 3rem auto; padding: 0 1.5rem; line-height: 1.7; color: #1f2430; }
  @media (prefers-color-scheme: dark) { body { color: #e5e7eb; background: #0f1115; } a { color: #93c5fd; } pre { background: #1a1d24 !important; } }
  h1, h2, h3, h4 { line-height: 1.3; font-weight: 650; margin-top: 2em; }
  h1 { font-size: 2em; } h2 { font-size: 1.5em; } h3 { font-size: 1.2em; }
  pre { background: #f4f5f7; padding: 1rem; border-radius: 8px; overflow: auto; }
  code { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em; }
  :not(pre) > code { background: rgba(127,127,127,0.15); padding: 0.15em 0.4em; border-radius: 4px; }
  img { max-width: 100%; border-radius: 8px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid rgba(127,127,127,0.3); padding: 0.5em 0.75em; text-align: left; }
  blockquote { border-left: 3px solid #6366f1; margin: 1em 0; padding: 0.2em 1em; color: #6b7280; }
  a { color: #4f46e5; }
  .heading-anchor { margin-left: 0.4em; opacity: 0.4; text-decoration: none; }
</style>
</head>
<body>
${fragment}
</body>
</html>
`
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)
}
