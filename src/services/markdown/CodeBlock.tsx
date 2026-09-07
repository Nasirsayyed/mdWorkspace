import { useState, useRef, type ReactNode } from 'react'
import clsx from 'clsx'

interface CodeBlockProps {
  className?: string
  children?: ReactNode
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as { props: { children?: ReactNode } }).props.children)
  }
  return ''
}

export function CodeBlock({ className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)
  const languageMatch = /language-(\w+)/.exec(className ?? '')
  const language = languageMatch ? languageMatch[1] : 'text'
  const codeText = extractText(children).replace(/\n$/, '')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText)
      setCopied(true)
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="code-block group">
      <div className="code-block__header">
        <span className="code-block__lang">{language}</span>
        <button type="button" className={clsx('code-block__copy', copied && 'is-copied')} onClick={handleCopy}>
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre className={className}>
        <code className={className}>{children}</code>
      </pre>
    </div>
  )
}
