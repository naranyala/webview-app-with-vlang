# Development

## Install

Install the V WebView module and frontend dependencies:

```sh
v install ttytm.webview
v ~/.vmodules/ttytm/webview/build.vsh
cd frontend-preact
npm ci --no-bin-links
```

Root build and test commands install with `npm ci --no-bin-links` every time.
A stale or incomplete installation is replaced from the lockfile; installation
failure stops the command instead of silently changing dependencies. Direct
frontend commands reuse the installed dependencies for faster iteration.

## Run

For browser development:

```sh
cd frontend-preact
npm run dev
```

For the native development shell, in a second terminal from the repository
root:

```sh
v -d dev run .
```

For a production-like local run:

```sh
v run build.vsh
./webview-app
```

## Validate

Run the complete project checks with:

```sh
v run build.vsh test
```

The command runs:

- `npm run check --prefix frontend-preact`
- `npm run check:bindings --prefix frontend-preact`
- `npm test --prefix frontend-preact`
- `v test bridge_test.v`
- `v test plugins_test.v`
- `v test server_test.v`
- `v test quiz_storage_test.v`
- `v test notes_storage_test.v`
- `v test storage_paths_test.v`
- `v test studio_test.v`
- `v test log_test.v`

The frontend test suite covers bridge parsing, asset/MIR contracts, fuzzy
search, and Academic Paper model normalization, IndexedDB migration, and Blob
asset persistence. Backend tests cover bridge validation/serialization, plugin
registration, static-server behavior, traversal protection, Notes/Quiz storage
CRUD and shared directory overrides, and studio volume/audio validation.
Autosave tests cover navigation, unmount, write ordering and failure recovery.

## Dependency Decisions

The first runtime validation dependency is `zod@^4.5.4`. It is used by
`frontend-preact/src/schemas.mjs` to normalize browser-persisted Todos, Chain
Notes, Academic Papers, and Quiz bridge payloads. It has no native dependency
and is compatible with the esbuild single-file frontend. The frontend schemas
discard malformed records for recovery, but V-side validation remains the
authority for native writes.

`dexie@^4.4.5` is used by `frontend-preact/src/storage.mjs` for the version-1
`webview-app` IndexedDB database. It is Apache-2.0, has no native dependency or
network behavior, and keeps Quiz in the separate V-backed JSON store. The generated single-file size should be measured after dependency changes;
PDF libraries contribute substantially to the bundle. `fake-indexeddb@^6.2.5` is dev-only test infrastructure and is not
bundled.

## Build Output

`npm run build --prefix frontend-preact` checks the source and writes the
generated frontend to `frontend-preact/dist/`, including a self-contained
`dist/index.html`. The native build then compiles `webview-app`; it does not
copy user data into the frontend directory.

The `build.vsh ui` command name is retained for compatibility, but it builds the
Preact studio frontend.

## Release Checklist

Before a release, verify the following manually because they are not yet
automated in CI:

- Build on a clean machine with the required native GTK/WebKitGTK packages.
- Run `v run build.vsh test` and `v run build.vsh`.
- Test the native WebView and window controls on the target platform.
- Confirm the local server serves only the generated frontend.
- Test Notes/Quiz persistence, rapid note edits/navigation, native PDF saves and browser exports.
- Use `debug: false` for a release build and document platform packaging.

Installers, platform-specific native implementations, CSP, graceful shutdown,
and CI release checks remain future work.
