# Webview App - Svelte + V

Desktop application using [ttytm/webview](https://github.com/ttytm/webview) with a Vite + Svelte frontend and V backend.

## Prerequisites

- [V compiler](https://github.com/vlang/v)
- [Node.js](https://nodejs.org/) (v18+)
- Linux: `webkit2gtk-4.1` and `gtk3` dev packages

### Install webview module

```sh
v install ttytm.webview
v ~/.vmodules/ttytm/webview/build.vsh
```

## Quick Start

```sh
# Build everything (UI + app)
v run build.vsh

# Run the app
./webview-app
```

## Development Mode

Run the Svelte dev server and V app separately:

```sh
# Terminal 1: Start Svelte dev server
cd ui && npm run dev

# Terminal 2: Run V app in dev mode
v -d dev run .
```

Development builds enable WebKit developer extras. On Linux, open the frontend
Inspector with `Ctrl+Shift+I` or right-click the page and choose `Inspect
Element`. Frontend console messages are also printed to the V terminal.

## Build Commands

| Command | Description |
|---------|-------------|
| `v run build.vsh` | Build UI + app |
| `v run build.vsh ui` | Build only Svelte UI |
| `v run build.vsh run` | Run compiled app |
| `v run build.vsh dev` | Run in dev mode |
| `v run build.vsh test` | Run frontend and backend tests |
| `v -d dev run .` | Run with dev mode flag |

## Project Structure

```
.
├── main.v              # V backend entry point
├── plugins.v           # Backend plugin registry
├── bridge.v            # Core WebView bridge plugin
├── server.v            # Local static UI server
├── build.vsh           # Build automation script
├── v.mod               # V module definition
└── ui/                 # Vite + Svelte frontend
    ├── src/
    │   ├── App.svelte
    │   ├── main.ts
    │   ├── bridge.d.ts
    │   ├── lib/
    │   └── plugins/
    ├── index.html
    ├── public/
    ├── package.json
    └── vite.config.ts
```

## V ↔ JavaScript Bridge

V functions are bound to the webview and callable from JavaScript. They return a
JSON response with a consistent `{ ok, data, error }` shape:

```v
// V side
fn greet_from_v(e &webview.Event) string {
    msg := e.get_arg[string](0) or { 'No message' }
    return bridge_success('V says: "${msg}"')
}
```

```javascript
// JavaScript side (Svelte)
const raw = await window.greet_from_v('Hello from Svelte!');
console.log(JSON.parse(raw)); // { ok: true, data: 'V says: "..."' }
```
