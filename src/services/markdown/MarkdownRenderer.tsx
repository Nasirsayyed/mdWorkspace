import { memo, useMemo, type ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'
import { markdownSanitizeSchema } from './sanitizeSchema'
import { CodeBlock } from './CodeBlock'

interface MarkdownRendererProps {
  content: string
  className?: string
}

type PreProps = ComponentProps<'pre'>
type AnchorProps = ComponentProps<'a'>

function isExternalUrl(href?: string): boolean {
  if (!href) return false
  return /^https?:\/\//i.test(href)
}

function PreRenderer({ children }: PreProps) {
  const child = Array.isArray(children) ? children[0] : children
  if (child && typeof child === 'object' && 'props' in child) {
    const codeProps = (child as { props: { className?: string; children?: React.ReactNode } }).props
    return <CodeBlock className={codeProps.className}>{codeProps.children}</CodeBlock>
  }
  return <pre>{children}</pre>
}

function AnchorRenderer({ href, children, ...rest }: AnchorProps) {
  if (isExternalUrl(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
        <span className="external-link-icon" aria-hidden="true">
          ↗
        </span>
      </a>
    )
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}

const rehypeAutolinkOptions = {
  behavior: 'append' as const,
  properties: { className: ['heading-anchor'], ariaLabel: 'Link to section' },
  content: { type: 'text' as const, value: '#' },
}

function MarkdownRendererImpl({ content, className }: MarkdownRendererProps) {
  const components = useMemo(
    () => ({
      pre: PreRenderer,
      a: AnchorRenderer,
      img: (props: ComponentProps<'img'>) => <img loading="lazy" decoding="async" {...props} alt={props.alt ?? ''} />,
    }),
    [],
  )

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, rehypeAutolinkOptions],
          rehypeHighlight,
          [rehypeSanitize, markdownSanitizeSchema],
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export const MarkdownRenderer = memo(MarkdownRendererImpl)
