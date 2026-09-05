# Studio Companion with V

A local-first offline desktop studio built with the [V language](https://vlang.io/),
[ttytm/webview](https://github.com/ttytm/webview), Preact, and esbuild. The
native shell owns the window, local HTTP server, and bridge. The canonical
frontend is the StyleX-powered Preact application in `frontend-preact/`,
shaped for Blender 3D and Music Information Retrieval workflows.

## Current Features

- Offline studio launcher with responsive navigation and native window controls.
- Production Log for Blender shots, listening notes, AI Q&A, local search, and
  PDF export.
- Drills for Blender, DSP, and music-theory practice backed by versioned JSON.
- Shots & Tasks with compact sidebar navigation, due dates, filters, and a
  monthly calendar picker.
- Research Desk for MIR/3D papers with references, image assets, and PDF flows.
- Asset Scanner for Blender scenes, samples, and renders with local job states.
- MIR Workbench for auditioning samples and inspecting tempo, key, loudness,
  chroma, and spectral summaries.
- MIR Lab for offline RMS/peak/ZCR analysis with a native V core and JS mirror.
- Blender Studio for scene, engine, and stage tracking with one-click log export.
- Consistent V-to-JavaScript bridge responses with validation and timeout
  handling.
- Local static server with URL decoding, method checks, MIME types, and path
  traversal protection.

## Prerequisites

- V compiler
- Node.js 18 or newer and npm
- Linux: GTK 3 and WebKitGTK 4.1 development packages
- The `ttytm.webview` V module

Install the WebView module with:

```sh
v install ttytm.webview
v ~/.vmodules/ttytm/webview/build.vsh
```

Native package names vary by distribution. Install the GTK/WebKitGTK
development packages provided by your operating system before compiling.

## Quick Start

Build the frontend and native application, then launch it:

```sh
v run build.vsh
./webview-app
```

The convenience script performs dependency checks, builds both layers, and
launches the result:

```sh
./run.sh
```

## Development

Run the Preact development server and V shell in separate terminals:

```sh
# Terminal 1
cd frontend-preact
npm ci --no-bin-links
npm run dev

# Terminal 2, from the repository root
v -d dev run .
```

The development shell enables WebKit developer extras. On Linux, open the
inspector with `Ctrl+Shift+I` or the page context menu. Frontend console output
is also forwarded to the V terminal.

## Commands

| Command | Purpose |
| --- | --- |
| `v run build.vsh` | Install dependencies if needed, build the frontend, and compile `webview-app`. |
| `v run build.vsh ui` | Build only the Preact frontend. |
| `v run build.vsh dev` | Run the V shell with the development frontend URL. |
| `v run build.vsh run` | Run the compiled application. |
| `v run build.vsh test` | Run frontend checks/tests and the V test files. |
| `npm run check --prefix frontend-preact` | Run Biome checks. |
| `npm test --prefix frontend-preact` | Run frontend Node tests. |
| `npm run build --prefix frontend-preact` | Create `frontend-preact/dist/index.html`. |
| `npm run bench:notes-search --prefix frontend-preact` | Compare note search implementations. |
| `npm run bench:notes-pdf --prefix frontend-preact` | Benchmark Node-compatible PDF renderers. |

## Architecture

```text
V process
├── main.v              window lifecycle and startup
├── server.v            loopback static server for frontend-preact/dist
├── bridge.v            WebView bindings and response envelope
├── mir_core.v          dependency-free time-domain MIR core (rms/peak/zcr)
├── studio_assets.v     volume and asset-scan job contracts
├── studio_mir.v        audio metadata, placeholder features, mir_analyze RPC
├── log.v               leveled logging (debug gated on dev builds)
├── quiz_storage.v      validated atomic JSON persistence
└── plugins.v           backend plugin registration + validation

frontend-preact
├── src/App.jsx         studio launcher, navigation, and workspace lifecycle
├── src/plugins/        registered studio tools (8: scanner, workbench,
│                       log, shots, drills, research, MIR lab, blender)
├── src/assets.mjs      asset classification and scan-job helpers
├── src/mir.mjs         time-domain core mirror + feature contracts
├── src/blender.mjs     scene validation, persistence, note export
├── src/stylex.js       extracted component styles
├── build.js            esbuild + StyleX + single-file output
└── dist/index.html     generated production asset
```

See the detailed documentation in [`docs/`](docs/), the current
[backlog](TODOS.md), and the proposed [abstraction layers](docs/abstraction-plan.md).

## Data and Privacy

Quiz data is stored by the V backend at the platform configuration directory,
normally `~/.config/webview-app/quizzes.json` on Linux. The file is versioned,
validated, protected by a mutex, and written through a temporary file followed
by rename.

Chain Notes uses native versioned JSON at `~/.config/webview-app/notes.json`
on Linux when the native bridge is present. Both native stores honor
`WEBVIEW_APP_DATA_DIR` as an override for the parent of `webview-app/`.

Browser Chain Notes, Todos, and Academic Papers use IndexedDB through Dexie,
with legacy localStorage migration and fallback. Academic image assets are stored
as Blobs in IndexedDB. Browser storage remains subject to quota limits. No cloud sync or remote data service is
configured.

## Bridge Contract

Native functions are exposed as `window.*` bindings and return JSON with the
shape `{ "ok": true, "data": "..." }` or
`{ "ok": false, "error": "..." }`. The frontend unwraps responses, validates
payloads, and rejects calls that exceed the bridge timeout. Studio bindings now
cover volumes, asset-scan jobs, audio metadata, placeholder spectral features,
and real time-domain `mir_analyze` alongside the
core Notes/Quiz/window surface. See [`docs/bridge-api.md`](docs/bridge-api.md),
[`docs/mir-lab.md`](docs/mir-lab.md), and
[`docs/blender-studio.md`](docs/blender-studio.md).

## Known Limitations

- Asset Scanner enumerates studio volumes natively and simulates local indexing
  until filesystem traversal lands; MIR Workbench uses native-validated
  contracts with placeholder features until real DSP lands.
- Native window lifecycle actions are implemented for Linux; other platforms
  return unsupported responses.
- The production HTTP server has no graceful shutdown path yet.
- Todos and Academic Papers are not V-backed; browser and native notes have no
  automatic migration or synchronization. Pending native note saves flush on
  workspace navigation and user-requested native close, but process-close/crash
  recovery is still open work.
- Release packaging, installers, CI, CSP, and platform-specific native
  dependency automation remain future work.

## License

No project license has been declared yet.
