export const demoContent: Record<string, string> = {
  readme: `# Markdown Workspace

Welcome to your **local-first documentation workspace**. Everything you see here is demo content, stored entirely in this browser via IndexedDB — nothing is uploaded anywhere.

## What is this?

A Markdown Workspace is a place to import, organize, read, and edit Markdown documentation without needing a server. Think of it as a personal mix of Notion, Obsidian, and a docs site — but private and offline-first.

## Highlights

- **Folders & tags** to organize hundreds of documents
- **Tabs** so you can work across multiple files at once
- **Edit / Split / Preview** modes powered by a full code editor
- Full-text **search** (\`Ctrl/Cmd + K\`) and a **command palette** (\`Ctrl/Cmd + Shift + P\`)
- **Version history**, **favorites**, **pinning**, and a **trash** you can restore from
- One-click **workspace backup** to a portable JSON file

## Getting started

1. Explore the sidebar — try \`Favorites\`, \`Recent\`, and the folders under **Documentation**.
2. Open a document and switch between Edit / Split / Preview using the toolbar.
3. Try \`Ctrl/Cmd + K\` to search across every document.
4. When you're ready, remove the demo content from **Settings → Storage**.

> Tip: press \`Esc\` any time to close a dialog, or enter **Focus Mode** for distraction-free reading.

## Table example

| Shortcut | Action |
| --- | --- |
| \`Ctrl/Cmd + K\` | Search |
| \`Ctrl/Cmd + Shift + P\` | Command palette |
| \`Ctrl/Cmd + N\` | New document |
| \`Ctrl/Cmd + S\` | Save |

\`\`\`ts
function greet(name: string): string {
  return \`Hello, \${name}! Welcome to your workspace.\`
}
\`\`\`

- [x] Import your first document
- [ ] Organize it into a folder
- [ ] Pin something important
`,
  gettingStarted: `# Getting Started

This guide walks through the core workflow of the workspace.

## 1. Import documents

Use **Import Markdown** in the top bar, drag files anywhere onto the window, or import a whole folder to preserve structure.

## 2. Organize

Create folders in the sidebar, then drag documents onto them. Nested folders are supported, and every folder can have its own color and icon.

## 3. Read & edit

Every document opens in a tab. Switch between **Edit**, **Split**, and **Preview** with the toolbar or \`Ctrl/Cmd + Shift + E\`.

## 4. Stay organized

Use **Favorites**, **Pinned**, and **Tags** to keep the documents you care about within reach. The **Recent** view remembers everything you've opened.

## 5. Back up

Your data lives only in this browser. Export a full workspace backup from **Settings → Workspace** regularly, especially before clearing browser data.
`,
  architecture: `# Architecture

This document describes how the workspace is put together.

## Storage layer

All documents, folders, settings, tabs, and version history are persisted in **IndexedDB** through a small storage abstraction (\`src/storage\`). Nothing touches \`localStorage\` for document content — it isn't reliable or large enough for a real document library.

\`\`\`
storage/
  db.ts        Dexie schema
  documents.ts CRUD + stats
  folders.ts   Folder tree operations
  settings.ts  Workspace preferences
  tabs.ts      Open tab persistence
  trash.ts     Soft-delete + restore
  versions.ts  Lightweight version history
\`\`\`

## State

Zustand stores wrap the storage layer and expose actions used by the UI: \`workspaceStore\`, \`tabsStore\`, \`settingsStore\`, and \`uiStore\`.

## Rendering

Markdown is parsed with **remark** and rendered with **rehype**, sanitized through \`rehype-sanitize\` before it ever reaches the DOM — untrusted Markdown can't inject scripts or unsafe links.

## Editing

The editor is built on **Monaco** (the engine behind VS Code), with Markdown-aware shortcuts, a formatting toolbar, and autosave.
`,
  apiReference: `# API Reference

> Example documentation for a fictional Warehouse API, used to demonstrate code blocks, tables, and nested lists.

## Authentication

All requests require a bearer token:

\`\`\`bash
curl https://api.example.com/v1/items \\
  -H "Authorization: Bearer $TOKEN"
\`\`\`

## Endpoints

### \`GET /items\`

Returns a paginated list of inventory items.

| Parameter | Type | Description |
| --- | --- | --- |
| \`page\` | number | Page number, starting at 1 |
| \`limit\` | number | Items per page (max 100) |
| \`tag\` | string | Filter by tag |

### \`POST /items\`

Creates a new item.

\`\`\`json
{
  "sku": "WMS-1029",
  "name": "Pallet Jack",
  "quantity": 12
}
\`\`\`

## Error handling

- \`400\` — Malformed request body
- \`401\` — Missing or invalid token
- \`404\` — Item not found
- \`429\` — Rate limit exceeded

## Rate limits

1. 600 requests / minute per token
2. Burst limit of 50 requests / second
   1. Sustained overages return \`429\`
   2. Back off using the \`Retry-After\` header
`,
  wmsOperations: `# WMS Operations

Operational notes for the warehouse management system pilot.

## Daily checklist

- [x] Verify overnight sync completed
- [x] Confirm inbound trucks scanned
- [ ] Reconcile cycle count variances
- [ ] Review exception queue

## Zones

| Zone | Purpose | Capacity |
| --- | --- | --- |
| A | Fast-moving SKUs | 1,200 pallets |
| B | Bulk storage | 3,400 pallets |
| C | Returns processing | 300 pallets |

## Escalation path

> If a pick discrepancy exceeds 2% for a shift, escalate to the shift lead immediately and pause auto-replenishment for the affected zone.

## Notes

Operations documentation tends to change often — this is a good candidate for **pinning** and checking **version history** after edits.
`,
  mobileApp: `# Mobile Application

Notes on the companion mobile scanning app.

## Supported platforms

- iOS 16+
- Android 12+

## Offline mode

The app queues scans locally and syncs when connectivity returns — similar in spirit to how this workspace itself works offline-first.

\`\`\`swift
func queueScan(_ scan: Scan) {
    localQueue.append(scan)
    if isOnline { flushQueue() }
}
\`\`\`

## Known issues

1. Barcode scanner occasionally requires camera permission re-grant after OS updates.
2. Push notifications may be delayed on poor connectivity.
`,
  deploymentGuide: `# Deployment Guide

How to ship this workspace as a static site.

## Build

\`\`\`bash
npm install
npm run build
\`\`\`

This produces a \`dist/\` folder containing a fully static site — no server required.

## Hosting targets

- **Netlify** — drag and drop \`dist/\`, or connect the repo. A \`netlify.toml\` with SPA fallback is included.
- **Vercel** — import the repo; \`vercel.json\` rewrites all routes to \`index.html\`.
- **Cloudflare Pages** — set the build command to \`npm run build\` and output directory to \`dist\`.
- **GitHub Pages** — a \`404.html\` fallback is included so client-side routes survive a hard refresh.

## Environment

No environment variables or backend services are required. Everything runs client-side.
`,
  troubleshooting: `# Troubleshooting

## The app shows "Storage limit reached"

Your browser's storage quota for this site has been exhausted. Try:

1. Deleting unused documents (check **Trash** too — items there still count).
2. Exporting your workspace as a backup, then clearing space.
3. Freeing disk space on your device — browsers reserve storage based on available disk.

## A document looks corrupted after import

The importer validates file type and size, but a malformed \`.md\` file can still render oddly. Open it in **Edit** mode to inspect the raw source.

## My changes didn't save

Check the save indicator in the status bar. If autosave is set to **Off**, use \`Ctrl/Cmd + S\` to save manually. Changes are never discarded silently — a document with unsaved edits shows a dot on its tab.

## I cleared my browser data and lost everything

Unfortunately, without a recent **workspace backup** (Settings → Workspace → Export Workspace), local-only data cannot be recovered. This is why regular backups matter for a local-first app.
`,
}
