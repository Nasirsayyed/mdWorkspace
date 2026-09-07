import { defaultSchema } from 'hast-util-sanitize'
import type { Schema } from 'hast-util-sanitize'

type PropertyDefinition = NonNullable<Schema['attributes']>[string][number]

/**
 * hast-util-sanitize's default schema restricts `className` on <a> to the
 * single literal value "data-footnote-backref" (for footnote support we
 * don't use). Any other class — like the "heading-anchor" class our
 * rehype-autolink-headings setup adds — would silently come out empty.
 * Drop that restrictive tuple before layering in our own permissive entry.
 */
function withoutClassNameRestriction(entries: PropertyDefinition[] | undefined): PropertyDefinition[] {
  return (entries ?? []).filter((entry) => !(Array.isArray(entry) && entry[0] === 'className'))
}

export const markdownSanitizeSchema: Schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'sup', 'sub'],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className'],
    a: [...withoutClassNameRestriction(defaultSchema.attributes?.a), 'title', 'target', 'rel', 'className'],
    span: ['className'],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto', 'tel'],
    src: ['http', 'https'],
  },
  // Heading ids are derived from the document's own headings (via rehype-slug)
  // and referenced by our on-page anchors and table-of-contents scroll-to
  // links. This is a single-user, local-first app with no untrusted
  // multi-author content model, so we skip DOM-clobbering id prefixing to
  // keep those anchors functional — aria-describedby/aria-labelledby
  // clobber protection stays on.
  clobber: ['ariaDescribedBy', 'ariaLabelledBy'],
}
