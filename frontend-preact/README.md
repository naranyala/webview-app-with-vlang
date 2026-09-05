# Studio Preact Frontend

This directory contains the studio frontend for the V WebView application. It
uses Preact, esbuild, and StyleX and produces the single-file asset served by
the native V process for Blender and MIR workflows.

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

The registry currently contains Asset Scanner, MIR Workbench, Production Log,
Shots & Tasks, Drills, Research Desk, MIR Lab, and Blender Studio.
Asset Scanner and MIR Workbench use
native-validated contracts with local simulation until filesystem traversal and
measured DSP land. Drills uses the V bridge in the native shell with a browser
fallback. Production Log, Shots & Tasks, Research Desk, studio assets, and
audio features use the versioned browser IndexedDB adapter, with a one-time
`localStorage` migration and fallback when IndexedDB is unavailable.

See the repository documentation for the complete runtime, bridge, storage,
and release model: [`../docs/`](../docs/).
