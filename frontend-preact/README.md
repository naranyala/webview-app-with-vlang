# Canonical Preact Frontend

This directory contains the current frontend for the V WebView application. It
uses Preact, esbuild, and StyleX and produces the single-file asset served by
the native V process. The Svelte application in `../ui/` is retained only as a
legacy reference.

## Commands

```sh
npm ci --no-bin-links
npm run dev          # check, build, and serve on http://localhost:3000
npm run check        # Biome checks
npm test             # Node test suite
npm run build        # generated frontend-preact/dist/index.html
```

Additional scripts compare note search and PDF renderers:

```sh
npm run bench:notes-search
npm run bench:notes-pdf
```

`npm run build` runs the check command before invoking `build.js`. The build
uses the StyleX esbuild plugin and inlines generated CSS and JavaScript into
`dist/index.html` through `plugins/single-file-html.js`.

## Tools

The Preact registry currently contains Disk Scanner, Audio Equalizer, Chain
Notes, Todos, Quiz, and Academic Paper. Disk Scanner and Audio Equalizer are
UI prototypes with mock data. Quiz uses the V bridge in the native shell and a
browser fallback during development. Chain Notes, Todos, and Academic Paper
keep their current data in browser `localStorage`.

See the repository documentation for the complete runtime, bridge, storage,
and release model: [`../docs/`](../docs/).
