# Markdown Workspace

A local-first Markdown documentation workspace — file manager, editor, reader, and
search, all running as a static web app with no backend. Every document, folder,
setting, and version lives in your browser's IndexedDB. Nothing is ever uploaded
anywhere.

## Table of contents

- [Quick start](#quick-start)
- [Features](#features)
- [Architecture](#architecture)
- [Storage](#storage)
- [Backup & restore](#backup--restore)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Deployment](#deployment)
- [Clearing browser storage](#clearing-browser-storage)
- [Testing](#testing)

## Quick start

```bash
npm install
npm run dev
```

Open the printed `http://localhost:5173` URL. On first launch you'll see an
onboarding screen — import your own Markdown files, create a blank document, or
load the bundled demo workspace to explore the UI.

### Build

```bash
npm run build
```

Produces a fully static `dist/` folder — no server, no environment variables,
no backend services required. `npm run preview` serves that build locally.

Both `npm run dev` and `npm run build` automatically copy the Monaco Editor
assets into `public/monaco` first (via `scripts/copy-monaco.mjs`), so the code
editor loads from your own origin instead of a CDN. This runs on `npm install`
too (`postinstall`), so a fresh clone works out of the box.

## Features

- **Import & organize** — drag & drop, multi-file import, folder import
  (preserves structure), nested folders with colors/icons, tags.
- **Tabs** — multiple open documents, pin/reorder/close-others, reopen the last
  closed tab, an unsaved-changes indicator per tab.
- **Edit / Split / Preview** — a Monaco-based editor with a Markdown toolbar,
  find & replace, and a sanitized live preview with syntax-highlighted code
  blocks (copy-to-clipboard), GitHub-flavored Markdown (tables, task lists,
  strikethrough, autolinked headings).
- **Outline & reading progress** — an auto-generated table of contents with
  scroll-spy, and a per-document reading-progress bar that offers to resume
  where you left off.
- **Search & command palette** — `Ctrl/Cmd+K` fuzzy-searches filenames,
  content, tags and folders; `Ctrl/Cmd+Shift+P` opens a full command palette.
- **Favorites, pinning, recent, trash** — soft-delete with restore, empty
  trash with confirmation, nothing is ever silently discarded.
- **Version history** — automatic snapshots on significant edits, with a
  view/compare/restore UI.
- **Workspace backup** — export everything (documents, folders, tags,
  settings, version history) to a single portable JSON file, and restore it
  later or on another device.
- **Themes & reading customization** — light/dark/system, 8 accent colors,
  font family/size/line-height/content-width controls, a distraction-free
  Focus Mode.
- **Responsive** — a collapsible sidebar drawer, a bottom-sheet outline, and a
  card-based document view on mobile/tablet.

## Architecture

```
src/
├── components/     UI components, grouped by feature area
│   ├── layout/       app shell, top bar, status bar
│   ├── sidebar/       workspace nav + folder tree (drag & drop)
│   ├── tabs/          the open-document tab bar
│   ├── editor/        Monaco wrapper + Markdown formatting toolbar
│   ├── preview/       sanitized Markdown renderer + reading progress
│   ├── outline/       table of contents (desktop panel + mobile sheet)
│   ├── search/         global Ctrl/Cmd+K search overlay
│   ├── command-palette/ Ctrl/Cmd+Shift+P command palette
│   ├── dialogs/        all modal dialogs (new doc/folder, move, versions…)
│   ├── document/       breadcrumbs, document header, action menus
│   └── common/         Menu, Toaster, EmptyState, Portal, drop zone
├── pages/           one component per route (Dashboard, FileManager, …)
├── services/
│   ├── storage/       re-exports src/storage (see below)
│   ├── markdown/       remark/rehype pipeline, sanitize schema, outline
│   ├── import/          file validation + reading
│   ├── export/          .md / .html / print
│   ├── search/           Fuse.js index + query
│   └── backup/           workspace export/import (JSON)
├── storage/          the IndexedDB abstraction (Dexie) — see below
├── state/            Zustand stores (workspace, tabs, settings, ui, …)
├── hooks/            shortcuts, session persistence, file pickers, …
├── utils/            text/stats, diffing, ids, error classification
├── types/            shared TypeScript types
└── data/             demo content + document templates
```

State flows one way: components call actions on the Zustand stores in
`src/state/`, those actions call the storage layer in `src/storage/` and then
update in-memory state so the UI re-renders. Components never talk to Dexie
directly.

Markdown is parsed with `remark` and rendered with `rehype`, and is always
passed through `rehype-sanitize` with a custom schema before it reaches the
DOM — untrusted Markdown cannot inject `<script>` tags, `javascript:` links,
or inline event handlers (see `src/services/markdown/sanitizeSchema.ts`).

## Storage

All data lives in **IndexedDB** via [Dexie](https://dexie.org/) — the
storage abstraction requested by the spec lives in `src/storage/`:

| File | Responsibility |
| --- | --- |
| `db.ts` | The Dexie schema (documents, folders, settings, tabs, versions, trash) |
| `documents.ts` | Document CRUD, stats computation, duplicate/rename/move |
| `folders.ts` | Folder tree operations, cascading moves on delete |
| `settings.ts` | Workspace preferences (theme, editor, reading, autosave, …) |
| `tabs.ts` | Open-tab persistence (order, pinned state) |
| `trash.ts` | Soft-delete, restore, permanent delete, empty trash |
| `versions.ts` | Lightweight per-document version snapshots |

`localStorage` is **not** used for document content — only IndexedDB, which
has a far larger quota and proper transactional writes. A document's reading
scroll position is stored as its `readingProgress` field, doubling as both
"where you left off" and the progress bar shown in the UI.

## Backup & restore

Your data only exists in this browser. To move it, share it, or protect it
before clearing site data:

1. **Settings → Workspace → Export Workspace** (or the ⋯ menu in the top bar,
   or the "Export Workspace" command in the command palette) downloads
   `markdown-workspace-backup-<date>.json` — documents, folders, tags,
   favorites/pinned state, version history, and settings.
2. **Settings → Workspace → Import Workspace** restores from that file. This
   **replaces** your current workspace — you'll be asked to confirm first.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + K` | Search |
| `Ctrl/Cmd + Shift + P` | Command palette |
| `Ctrl/Cmd + N` | New document |
| `Ctrl/Cmd + O` | Import Markdown |
| `Ctrl/Cmd + S` | Save |
| `Ctrl/Cmd + F` | Find (in the editor) |
| `Ctrl/Cmd + H` | Replace (in the editor) |
| `Ctrl/Cmd + B` / `Ctrl/Cmd + I` | Bold / Italic (in the editor) |
| `Ctrl/Cmd + Shift + E` | Toggle Edit / Split |
| `Ctrl/Cmd + \` | Toggle sidebar |
| `Ctrl/Cmd + Shift + F` | Focus mode |
| `Ctrl/Cmd + W` | Close tab |
| `Ctrl/Cmd + Shift + T` | Reopen closed tab |
| `Esc` | Close modal / menu / exit focus mode |

Also available under **Settings → Keyboard Shortcuts** in the app.

## Deployment

The build output (`dist/`) is a plain static site — deploy it anywhere that
serves static files. Because this is a single-page app with client-side
routing, the host needs to fall back to `index.html` for unknown paths:

- **Netlify** — `netlify.toml` is included (build command + SPA redirect).
- **Vercel** — `vercel.json` is included (rewrites all routes to `index.html`).
- **Cloudflare Pages** — set build command `npm run build`, output `dist`;
  `public/_redirects` (copied into `dist/`) handles the SPA fallback.
- **GitHub Pages** — `public/404.html` + a small restore script in
  `index.html` implement the standard [SPA-on-GitHub-Pages
  trick](https://github.com/rafgraph/spa-github-pages): a hard refresh on a
  route like `/document/abc123` redirects through `404.html` and the app
  restores the real URL before the router mounts. If you deploy to a
  *project* page (`username.github.io/repo-name/`, not a custom domain or a
  root `username.github.io`), open `public/404.html` and set
  `pathSegmentsToKeep = 1`.
- **Any static server** (`serve`, `nginx`, S3 + CloudFront, …) — configure a
  catch-all rewrite to `index.html` (nginx: `try_files $uri /index.html;`).

No environment variables, secrets, or backend services are required for any
of the above.

## Clearing browser storage

Everything the app stores lives under this site's origin in your browser:

- **In-app**: Settings → Storage → **Clear Workspace** wipes documents,
  folders, tabs, versions, and trash (with a confirmation prompt). Export a
  backup first if you want to keep anything.
- **Manually**: your browser's site data / storage settings for this origin
  (e.g. Chrome DevTools → Application → Storage → "Clear site data") removes
  the same IndexedDB database. This is irreversible without a prior backup.

## Testing

```bash
npm test
```

Runs the Vitest suite (storage CRUD/restore, search, Markdown
sanitization/outline extraction, import validation, diffing, settings) against
`fake-indexeddb` + `jsdom`.

## Privacy

This is a local-first application. Your documents are stored only in this
browser. Nothing is uploaded to a server unless a future integration
explicitly adds one.
