# Proposed Abstraction Boundaries

Status: incremental proposal, 2026-09-05. Only the autosave coordinator and shared
native storage path are introduced in this change. Remaining work is tracked by
stable IDs in [TODOS.md](../TODOS.md).

## Why change the boundaries

`ChainNotes` currently owns UI state, storage selection, native calls, debouncing,
search and export. `backend.js` mixes transport, payload normalization, capability
detection and mocks. `bridge.v` mixes event parsing, domain operations, filesystem
export and platform window dispatch. These seams make behavior differ between the
browser and native shell and make lifecycle bugs difficult to test.

Keep the current single application and static plugin registry. A service framework,
generic persistence engine or runtime plugin system would add complexity before it
solves a demonstrated problem.

## Target flow

```text
UI components and tool hooks
  -> domain repositories / document services
    -> native domain clients OR browser repositories
      -> bridge transport OR Dexie adapter

V event bindings
  -> domain stores / background job services
    -> atomic file utilities / platform adapters

AppRuntime owns config, window, HTTP server, stores, jobs and shutdown.
```

Dependencies should point down this diagram. Storage code must not import JSX;
transport must not decide whether a note belongs in browser or native storage.

## 1. Tool repositories (L03, R02, R08)

Start with Notes. A repository exposes asynchronous `list`, `create`, `update`,
`delete` and `flush`, plus observable pending/saving/error status. A tool hook owns
selection and draft state; the component renders it. Native and browser repositories
share a conformance test suite for CRUD, empty data, validation and failures.

Select the repository once at application startup using explicit capabilities.
Never silently switch a failed native write into a browser write: those are separate
stores and doing so creates hidden divergence. Import is a separate operation with
preview, backup and a conflict policy.

The repository owns the save queue across workspace mounts. AppRuntime awaits its
flush before a user-requested close and leaves the window open on failure. A durable
local draft can recover abrupt termination; awaiting a Promise cannot protect a
process that has already exited.

The new `autosave.mjs` is the first small extraction: it coalesces pending edits by
key and serializes writes. The component flushes it on navigation and unmount,
and registers its flusher so the shell can await it before native close. It does
not yet supply dirty-state UI or crash recovery.

## 2. Bridge transport and domain clients (L04, N03)

A transport owns invocation, response envelopes, timeout and error conversion.
Domain clients own Notes/Quiz/PDF payload validation. Browser mocks implement the
same public contract but stay out of the native transport.

Use a checked manifest of method names, arguments, results, error codes and capability
versions. Keep existing `window.*` names as compatibility wrappers while introducing
a namespaced frontend API. Generate declarations/check registration from this source
only when the generator validates signatures rather than substring presence.

On the V side, group handlers by domain (notes, quiz, window, export). Keep event
argument parsing at the boundary and pure validation in the domain. Do not move files
into V modules until visibility and WebView linking have been tested.

## 3. Native persistence utilities (L02, L05, R06)

`storage_paths.v` now resolves both stores through the same policy. The default
remains `<os.config_dir()>/webview-app`; `WEBVIEW_APP_DATA_DIR` overrides its parent.
No existing data is moved.

Next extract atomic replacement and temporary-file cleanup. The utility accepts a
path and serialized bytes, and returns a structured I/O error. Stores continue to
own schema versions, normalization, limits, locking and rollback. Define multi-process
locking and crash durability explicitly before claiming writes are fully durable.

Do not combine Notes and Quiz into a generic store: their models, validation and
migration rules differ. SQLite is appropriate later for measured scan-cache/search
requirements, not as a prerequisite for reliable JSON CRUD.

## 4. Runtime, jobs and platform adapters (L06, N06–N09, D02)

Introduce AppRuntime when fixing lifecycle ownership. It starts the server, verifies
its own launch identity, creates the window, and releases resources in a documented
order. Runtime config separates packaged asset locations from compile-time checkout
paths and user data.

Platform adapters expose window actions, dialogs, volumes and audio capabilities.
Unsupported capabilities are explicit so the UI can explain them before invocation.

A background job service is needed before real disk scanning. Define queued/running/
completed/failed/cancelled transitions, bounded progress snapshots, cancellation and
cleanup. Keep filesystem traversal testable against temporary directories without
requiring a WebView. Polling is sufficient initially; add streaming only when needed.

## 5. Document export (L07, E01–E03)

Normalize a document once, including ordered citations and figure references. Feed
that model to print/HTML and PDF renderers. A separate destination adapter handles
browser download or native save dialog, cancellation and filename policy.

Test model correctness separately from renderer output. Validate rendered PDFs for
page boundaries, selectable text where promised, Unicode, image inclusion and readable
code. Preserve the existing export paths while establishing parity; do not promise
identical output from text and raster renderers without testing it.

## Migration order and exit criteria

1. Completed here: ordered autosave plus shared native paths, with regressions.
2. Notes repository and save status: navigation/reopen/close/failure tests pass.
3. Bridge contract: all existing bindings pass conformance tests in native and mock modes.
4. Runtime ownership: occupied port, relocated assets, startup failure and shutdown tests pass.
5. Jobs and disk scanning: fixture trees, cancellation and large-tree manual checks pass.
6. Export services and remaining repositories: storage migrations and document parity pass.
7. Audio backend: implement only after player scope and supported platform matrix are settled.

Avoid a large directory move alongside behavior changes. Keep each migration reviewable,
retain persisted-format compatibility, and update the tracker when its exit criteria pass.
