# Webview App - Preact + V

Desktop application using [ttytm/webview](https://github.com/ttytm/webview) with a Preact + esbuild frontend and V backend.

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
# Build everything (frontend + app)
v run build.vsh

# Run the app
./webview-app
```

## Development Mode

Run the Preact dev server and V app separately:

```sh
# Terminal 1: Start Preact dev server
cd frontend-preact && npm run dev

# Terminal 2: Run V app in dev mode
v -d dev run .
```

Development builds enable WebKit developer extras. On Linux, open the frontend
Inspector with `Ctrl+Shift+I` or right-click the page and choose `Inspect
Element`. Frontend console messages are also printed to the V terminal.

## Build Commands

| Command | Description |
|---------|-------------|
| `v run build.vsh` | Build frontend + app |
| `v run build.vsh ui` | Build frontend only |
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
├── server.v            # Local static frontend server
├── build.vsh           # Build automation script
├── v.mod               # V module definition
├── frontend-preact/    # Canonical Preact + esbuild frontend
│   ├── src/main.jsx
│   ├── public/index.html
│   ├── build.js
│   └── package.json
└── ui/                 # Legacy Svelte frontend
```

## V ↔ JavaScript Bridge

V functions are bound to the webview and callable from JavaScript. The bridge is
available to the frontend for future native features. Methods return a JSON
response with a consistent `{ ok, data, error }` shape:

```v
// V side
fn greet_from_v(e &webview.Event) string {
    msg := e.get_arg[string](0) or { 'No message' }
    return bridge_success('V says: "${msg}"')
}
```

```javascript
// JavaScript side (Preact)
const raw = await window.greet_from_v('Hello from Preact!');
console.log(JSON.parse(raw)); // { ok: true, data: 'V says: "..."' }
```
