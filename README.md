# WebView App with V

A local desktop toolkit built with the [V language](https://vlang.io/),
[ttytm/webview](https://github.com/ttytm/webview), Preact, and esbuild. The
native shell owns the window, local HTTP server, and bridge. The canonical
frontend is the StyleX-powered Preact application in `frontend-preact/`.

## Current Features

- Toolkit launcher with responsive navigation and native window controls.
- Chain Notes for editable AI questions and answers, local search, and PDF
  export.
- Quiz sessions and collection/question editing backed by versioned JSON in the
  operating system configuration directory.
- Todos with compact sidebar navigation, due dates, filters, and a monthly
  calendar picker.
- Academic Paper reader with a two-column layout, reference manager, image
  asset library, and print/download PDF flows.
- Interactive Audio Equalizer and Disk Scanner UI prototypes using mock data.
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
├── quiz_storage.v      validated atomic JSON persistence
└── plugins.v           backend plugin registration

frontend-preact
├── src/App.jsx         launcher, shell navigation, and workspace lifecycle
├── src/plugins/        registered Preact tools
├── src/stylex.js       extracted component styles
├── build.js            esbuild + StyleX + single-file output
└── dist/index.html     generated production asset
```

The `ui/` directory is the legacy Svelte/Vite frontend and is not used by the
current root build. See the detailed documentation in [`docs/`](docs/).

## Data and Privacy

Quiz data is stored by the V backend at the platform configuration directory,
normally `~/.config/webview-app/quizzes.json` on Linux. The file is versioned,
validated, protected by a mutex, and written through a temporary file followed
by rename.

Chain Notes, Todos, and Academic Papers currently use browser `localStorage`.
Academic image assets are stored as browser data URLs, so large image libraries
can reach browser storage limits. No cloud sync or remote data service is
configured.

## Bridge Contract

Native functions are exposed as `window.*` bindings and return JSON with the
shape `{ "ok": true, "data": "..." }` or
`{ "ok": false, "error": "..." }`. The frontend unwraps responses, validates
payloads, and rejects calls that exceed the bridge timeout. See
[`docs/bridge-api.md`](docs/bridge-api.md).

## Known Limitations

- Disk Scanner and Audio Equalizer are currently frontend prototypes; they do
  not enumerate real disks or process audio.
- Native window lifecycle actions are implemented for Linux; other platforms
  return unsupported responses.
- The production HTTP server has no graceful shutdown path yet.
- Chain Notes, Todos, and Academic Papers are not yet V-backed or synchronized
  across native/browser storage.
- Release packaging, installers, CI, CSP, and platform-specific native
  dependency automation remain future work.

## License

No project license has been declared yet.
