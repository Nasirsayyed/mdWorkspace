// Copies the Monaco Editor AMD build into public/monaco so the app can load
// the editor entirely from same-origin static assets — no CDN, works offline.
import { cpSync, existsSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const src = path.resolve(dirname, '../node_modules/monaco-editor/min/vs')
const destRoot = path.resolve(dirname, '../public/monaco')
const dest = path.join(destRoot, 'vs')

if (!existsSync(src)) {
  console.error('[copy-monaco] monaco-editor/min/vs not found — run npm install first.')
  process.exit(1)
}

if (existsSync(destRoot)) rmSync(destRoot, { recursive: true, force: true })
cpSync(src, dest, { recursive: true })
console.log('[copy-monaco] Copied Monaco Editor assets to public/monaco/vs')
