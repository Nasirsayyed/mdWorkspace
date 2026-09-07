import { loader } from '@monaco-editor/react'

// Load Monaco entirely from same-origin static assets (public/monaco/vs, copied
// from node_modules by scripts/copy-monaco.mjs) instead of a CDN — the workspace
// works fully offline and never depends on a third-party host.
loader.config({ paths: { vs: `${import.meta.env.BASE_URL}monaco/vs` } })
