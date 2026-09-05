# Architecture

## Runtime Topology

The application is a desktop WebView process with a local frontend server:

```text
webview-app
  ├─ creates the ttytm.webview window
  ├─ registers V functions as window bindings
  ├─ serves frontend-preact/dist on 127.0.0.1:4321
  └─ navigates the window to the local server

frontend-preact
  ├─ Preact shell and plugin registry
  ├─ versioned Dexie storage for browser-local tools
  ├─ browser-compatible mocks for development
  └─ generated single-file dist/index.html
```

In development, `v -d dev run .` navigates to `http://localhost:3000`, so the
Preact dev server must be running separately. In a normal build, V starts the
loopback server after verifying that the generated frontend exists.

## Native Layers

- `main.v` creates the window, initializes `NoteStore` and `QuizStore`, binds capabilities, and
  chooses development or production navigation.
- `mir_core.v` owns dependency-free time-domain analysis; `studio_mir.v`
  exposes it over `mir_analyze` with bounded payloads and stable error codes.
- `log.v` gates debug output on dev builds; `plugins.v` validates plugin IDs
  and skips disabled plugins.
- `config.v` centralizes the frontend paths, URLs, window dimensions, title, and
  debug flag.
- `server.v` serves only files below `frontend-preact/dist`. It accepts GET and
  HEAD, rejects unsupported methods, decodes URLs, blocks traversal, and
  returns MIME types.
- `plugins.v` registers backend capabilities. `bridge.v` currently contains the
  core bridge, Notes/Quiz CRUD and native PDF saving.
- `storage_paths.v` resolves a shared native data-directory policy.
- `notes_storage.v` owns version-1 native Notes JSON persistence and CRUD.
- `quiz_storage.v` owns version-1 Quiz JSON persistence, validation, locking,
  IDs, limits, and atomic writes.

The production server currently binds to `127.0.0.1:4321`. Graceful shutdown
and explicit webview creation failure handling are still open work.

## Frontend Layers

`frontend-preact/src/App.jsx` owns navigation and window lifecycle concerns. A
small plugin contract in `src/plugins/contract.js` validates each manifest;
`src/plugins/index.js` registers the eight current tools:

- Asset Scanner: studio volumes, local job states, and Blender/audio/render
  classification (real traversal pending).
- MIR Workbench: local sliders, presets, and placeholder spectral summaries.
- Production Log: local Q&A notebook with search and export.
- Shots & Tasks: local task list with filters, due dates, hash navigation, and
  a monthly calendar workspace.
- Drills: study sessions and collection/question editor using the native bridge
  when available.
- Research Desk: local paper reader, Reference Manager, Image Assets, and
  two-column PDF/print output.
- MIR Lab: offline RMS/peak/ZCR analysis with native V core and JS mirror.
- Blender Studio: scene, engine, and stage tracking with log export.

Todos, browser Chain Notes, and Academic Papers use the version-1 Dexie adapter
in `src/storage.mjs`. Native Chain Notes and Quiz use V-backed JSON stores.
`src/autosave.mjs` serializes native note updates and flushes on navigation and
user-requested native close; application-wide dirty-state and crash recovery
remain open. The adapter retains
a one-time raw `localStorage` migration backup and falls back to `localStorage`
when IndexedDB is unavailable.

Component styles are authored in `src/stylex.js`. `build.js` runs esbuild with
the StyleX plugin and the single-file plugin, producing a self-contained
`dist/index.html` for the V server. `src/styles.css` is limited to the document
reset and print scaffold.

## Browser Fallbacks

The frontend detects native bindings at runtime. When they are absent during
browser development, `src/backend.js` supplies mock values for core status and
counter calls, while Quiz falls back to a browser-local implementation. Calls
to a present native binding are bounded by an eight-second timeout.

The fallback does not make mock Disk Scanner or Audio Equalizer data real; those
two plugins remain intentionally frontend-only prototypes.

## Planned Boundaries

See [abstraction-plan.md](abstraction-plan.md) for repository, transport, runtime,
platform and document-service boundaries, with migration criteria. Track all
remaining work in [TODOS.md](../TODOS.md).
