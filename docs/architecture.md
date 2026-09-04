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
  ├─ browser-compatible mocks for development
  └─ generated single-file dist/index.html
```

In development, `v -d dev run .` navigates to `http://localhost:3000`, so the
Preact dev server must be running separately. In a normal build, V starts the
loopback server after verifying that the generated frontend exists.

## Native Layers

- `main.v` creates the window, initializes `QuizStore`, binds capabilities, and
  chooses development or production navigation.
- `config.v` centralizes the frontend paths, URLs, window dimensions, title, and
  debug flag.
- `server.v` serves only files below `frontend-preact/dist`. It accepts GET and
  HEAD, rejects unsupported methods, decodes URLs, blocks traversal, and
  returns MIME types.
- `plugins.v` registers backend capabilities. `bridge.v` currently contains the
  core bridge and Quiz CRUD bindings.
- `quiz_storage.v` owns version-1 Quiz JSON persistence, validation, locking,
  IDs, limits, and atomic writes.

The production server currently binds to `127.0.0.1:4321`. Graceful shutdown
and explicit webview creation failure handling are still open work.

## Frontend Layers

`frontend-preact/src/App.jsx` owns navigation and window lifecycle concerns. A
small plugin contract in `src/plugins/contract.js` validates each manifest;
`src/plugins/index.js` registers the six current tools:

- Disk Scanner: mock storage data and a simulated scan.
- Audio Equalizer: local sliders, presets, and visualizer prototype.
- Chain Notes: local Q&A notebook with search and export.
- Todos: local task list with filters and hash navigation.
- Quiz: study sessions and collection/question editor using the native bridge
  when available.
- Academic Paper: local paper reader, Reference Manager, Image Assets, and
  two-column PDF/print output.

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
