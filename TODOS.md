# Development TODOs

The active frontend is `frontend-preact/`. The `ui/` Svelte application is kept
only as a legacy reference until it is archived or removed.

## Phase 1: Stabilize Foundation

- [x] Add a backend configuration layer for ports, dev mode, window size, and debug logging.
- [x] Replace the fixed 300 ms server delay with a readiness check.
- [x] Bind the production HTTP server to `127.0.0.1` instead of all interfaces.
- [x] Prevent path traversal in `StaticHttpHandler`.
- [x] Add backend unit tests for static-file serving and URL handling.
- [ ] Add graceful shutdown for the HTTP server and webview.
- [ ] Document and automate installation of `ttytm.webview` and native Linux dependencies.
- [x] Add frontend tests or at least component-level interaction tests.
- [x] Make frontend installation reproducible with `npm ci --no-bin-links`,
  with a documented fallback for incomplete lockfiles or native environments.

## Phase 2: Improve the V-to-JavaScript API

- [ ] Create a clear API namespace instead of attaching loose functions directly to `window`.
- [x] Add TypeScript declarations for backend methods.
- [x] Define consistent request and response formats.
- [x] Add structured error responses from V.
- [x] Validate and sanitize arguments received from JavaScript.
- [ ] Add logging levels for development and production.
- [x] Add a health/status bridge method for frontend startup checks.
- [ ] Add integration tests for every JavaScript-to-V binding, including
  malformed arguments and backend failures.

## Phase 3: Build Real Backend Features

- [ ] Decide where application state should live: in-memory, SQLite, or files.
- [x] Separate backend configuration, bridge, server, and plugin responsibilities.
- [ ] Add persistence and migrations if data must survive restarts.
- [ ] Add domain models and validation.
- [ ] Define background-job, cancellation, and progress handling for
  operations that may block the UI.
- [ ] Add configuration and data-directory handling per operating system.
- [ ] Add import/export or backup support if user data is involved.

## Phase 4: Build the Frontend Application

- [x] Replace the demo page with the Preact toolkit launcher and registered tool workflow.
- [ ] Complete one toolkit workflow end to end with real V backend data instead of mock data.
- [ ] Create reusable components for buttons, forms, dialogs, notifications, and loading states.
- [x] Add a typed bridge client for all V calls.
- [ ] Add centralized frontend state management only when multiple screens require it.
- [x] Handle backend unavailable, timeout, and validation states.
- [ ] Add routing if the app needs multiple screens.
- [x] Add responsive layouts for smaller windows.
- [x] Add keyboard navigation, visible focus states, and accessible labels.
- [ ] Add light/dark theme support if appropriate.
- [x] Add empty, loading, success, and error states for every major view.

## Phase 5: Packaging and Release

- [x] Decide to keep the UI as an external single-file build served by the local V HTTP server.
- [ ] Document the frontend packaging decision and remove unused Svelte-era
  build scripts, including `inline.cjs`.
- [ ] Add release builds with `debug: false`.
- [ ] Add platform-specific build scripts for Linux, Windows, and macOS.
- [ ] Package native webview dependencies.
- [ ] Add application icon, metadata, versioning, and installers.
- [ ] Add CI checks for frontend formatting, frontend build, V compilation, and backend tests.
- [ ] Add crash reporting or diagnostic logs.
- [ ] Verify that production builds work on clean machines.
- [ ] Verify the native shell and WebView dependencies on Linux, macOS, and Windows.

## Plugin Architecture

- [x] Add a frontend plugin registry containing tool metadata and components.
- [x] Render the active frontend tool through its registered component.
- [x] Add separate frontend plugin components for Disk Scanner, Audio Equalizer, and Chain Notes.
- [x] Add a backend plugin registry for registering V capabilities.
- [x] Register the existing WebView bridge as the first backend plugin.
- [x] Add registry tests on both frontend and backend.
- [ ] Add plugin lifecycle hooks for initialization and cleanup.
- [ ] Add plugin capability/version metadata.
- [ ] Add optional plugin enable/disable configuration.
- [ ] Add runtime plugin discovery when external plugins are required.
- [ ] Keep frontend and backend plugin manifests aligned through shared
  capability names or generated metadata.

## Recommended First Milestone

- [x] Secure and stabilize the V server.
- [x] Add typed bridge declarations.
- [x] Separate backend code into modules.
- [x] Replace the demo UI with the Preact toolkit shell.
- [x] Complete one real backend-connected workflow.
- [x] Add complete error and loading states across every major view.
- [ ] Add automated checks and a reproducible release build.

## Toolkit Implementation Plan

### Dependencies

- [x] Keep `ttytm.webview` for the V desktop shell.
- [ ] Use V standard library APIs for real disk scanning.
- [x] Implement native Linux window lifecycle bindings: minimize, maximize, restore, and close.
- [ ] Add native window lifecycle implementations for macOS and Windows.
- [ ] Add platform-specific disk capacity wrappers: `statvfs` for Linux/macOS
  and `GetDiskFreeSpaceExW` for Windows.
- [ ] Vendor or package `miniaudio.h` for audio playback and decoding.
- [ ] Implement equalizer DSP with biquad filters or miniaudio DSP nodes.
- [ ] Consider GStreamer for advanced audio pipelines and codec support.
- [ ] Consider PipeWire or PulseAudio only for system-wide audio processing.
- [x] Use CSS, SVG, or Canvas for frontend visualizations without a chart dependency.

### Scope Decision

- [ ] Start Audio Equalizer as an application-local audio player.
- [ ] Defer system-wide equalizer support until the local player is complete.

### Backend and Release Quality

- [x] Add a real `get_system_info()` bridge method instead of adapting the
  greeting method as a placeholder.
- [x] Add a V-backed counter for `BackendStatus`.
- [ ] Define a stable RPC contract with method names, argument schemas, return
  types, and versioning.
- [x] Add a production error boundary or fallback screen in the Preact shell.
- [ ] Add a Content Security Policy and restrict unintended navigation or external content.
- [ ] Decide whether local notes should persist across launches and choose
  files, SQLite, or another storage layer.

### Disk Scanner Backend

- [ ] Add `disk_scanner.v`.
- [ ] Enumerate available drives or mount points.
- [ ] Accept a selected directory from the frontend.
- [ ] Recursively scan directories with `os.walk_with_context`.
- [ ] Read file sizes with `os.file_size`.
- [ ] Aggregate directory sizes.
- [ ] Skip symlinks or track visited paths to avoid loops.
- [ ] Continue scanning when permission errors occur.
- [ ] Add cancellation for large scans.
- [ ] Sort results by size.
- [ ] Stream scan progress to the frontend.
- [ ] Replace mock folder data with real scan results.

### Disk Scanner Bridge API

- [ ] Implement `list_volumes()`.
- [ ] Implement `start_disk_scan(path)`.
- [ ] Implement `get_disk_scan_status(job_id)`.
- [ ] Implement `cancel_disk_scan(job_id)`.
- [ ] Return job state, scanned file count, scanned bytes, current path, and top directories.
- [ ] Populate the drive selector from `list_volumes()`.
- [ ] Enable scanning after validating the selected location.
- [ ] Display progress and scanned file count.
- [ ] Add a cancel action.
- [ ] Display permission and filesystem errors.

### Audio Equalizer Backend

- [ ] Add `audio_equalizer.v` and `audio_player.v`.
- [ ] Vendor and bind `miniaudio.h`.
- [ ] Initialize an audio playback device.
- [ ] Load supported audio files.
- [ ] Decode audio into PCM frames.
- [ ] Create seven frequency bands.
- [ ] Apply biquad filters to each audio block.
- [ ] Support play, pause, and stop.
- [ ] Update band gain in real time.
- [ ] Add preset loading.
- [ ] Expose playback position and duration.
- [ ] Calculate optional peak/RMS meters.
- [ ] Release audio resources when switching tracks.
- [ ] Handle unsupported formats and missing audio devices.

### Audio Equalizer Bridge API

- [ ] Implement `load_audio_file(path)`.
- [ ] Implement `play_audio()`.
- [ ] Implement `pause_audio()`.
- [ ] Implement `stop_audio()`.
- [ ] Implement `set_equalizer_band(index, gain_db)`.
- [ ] Implement `apply_equalizer_preset(name)`.
- [ ] Implement `get_playback_state()`.
- [ ] Implement `get_audio_levels()`.
- [ ] Add a frontend file picker.
- [ ] Enable playback controls after loading a file.
- [x] Make EQ sliders interactive.
- [ ] Debounce slider updates before calling V.
- [x] Show active preset state.
- [ ] Display playback progress.
- [ ] Display output-device and decoding errors.
- [ ] Render live level meters.

### Toolkit Backend Structure

- [ ] Add `backend/disk_scanner.v`.
- [ ] Add `backend/audio_equalizer.v`.
- [ ] Add `backend/audio_player.v`.
- [ ] Add `backend/jobs.v`.
- [ ] Add `backend/platform_linux.v`.
- [ ] Add `backend/platform_windows.v`.
- [ ] Add `backend/platform_macos.v`.
- [ ] Keep WebView bridge bindings in `bridge.v`.

### Toolkit Development Order

- [ ] Complete Disk Scanner before starting audio playback.
- [ ] Add real drive enumeration.
- [ ] Add recursive scanning and progress updates.
- [ ] Connect Disk Scanner UI to real data.
- [ ] Add `miniaudio.h`.
- [ ] Implement audio file loading and playback.
- [ ] Implement one equalizer band.
- [ ] Expand to seven bands.
- [ ] Add presets and meters.
- [ ] Add cancellation, error handling, and tests.

## Chain Notes

- [x] Add Chain Notes as a launcher and sidebar module.
- [x] Add a selectable note list and editable note title/body.
- [x] Add note metadata and word count display.
- [x] Add client-side PDF export with `jsPDF`.
- [x] Add export success and error states.
- [ ] Persist notes through the V backend.
- [x] Add create and rename note actions.
- [ ] Add delete and reorder note actions.
- [x] Add local note search and filtering.
- [ ] Add import from Markdown or plain text.
- [ ] Add PDF styling options and chained-note export.

## Codebase Scan Findings

### Backend Correctness and Safety

- [ ] Extract pure `validate_greet_message` and `parse_increment_delta`
  helpers so bridge validation is unit-testable without a WebView `Event`.
- [ ] Add bridge tests for greet and increment edge cases: missing argument,
  oversize message, non-integer delta, and extra arguments.
- [ ] Make `CounterState` unlock panic-safe with deferred unlock instead of
  manual lock and unlock pairs.
- [ ] Remove the `unsafe { nil }` default in `BackendPlugin.register` or add
  an explicit nil check before invoking plugin registration.
- [ ] Standardize the timestamp bridge format: `get_time` currently returns a
  human-readable string while the browser mock returns Unix seconds.
- [ ] Check `webview.create` for failure instead of assuming window creation
  always succeeds.
- [ ] Deduplicate the GTK dispatch blocks in `minimize_window`,
  `maximize_window`, and `restore_window` behind one window-action helper.

### Local Server and Configuration

- [ ] Reject non-`GET` methods and directory paths explicitly in
  `StaticHttpHandler` instead of falling through to file reads.
- [ ] Add server tests for query-string stripping, missing files, directory
  requests, and HTML, JS, and CSS content types.
- [ ] Allow environment overrides for production port, dev URL, window title,
  and window size to avoid hardcoded conflicts in CI and parallel checkouts.
- [ ] Track the spawned frontend server and shut it down when the WebView
  exits, including `SIGINT` and `SIGTERM` handling.
- [ ] Evaluate localhost hardening for the production server, such as an
  origin check or per-launch token, or document why `127.0.0.1` is enough.

### Build, Scripts, and Toolchain

- [ ] Rename the `build.vsh ui` command to `frontend` while keeping `ui` as a
  temporary alias.
- [ ] Add a `build.vsh clean` command for `webview-app`, `dist`, generated
  assets, and other build outputs.
- [ ] Run `v fmt -c` and `v vet` in `build.vsh test`, and replace the
  hardcoded test-file list with `v test .`.
- [ ] Skip frontend dependency installation when the lockfile is unchanged,
  instead of running `npm ci` on every build.
- [ ] Align `run.sh` with `build.vsh` by using `npm ci --no-bin-links` with
  an `npm install` fallback, plus preflight checks for V, Node, `pkg-config`,
  GTK, and WebKitGTK.
- [ ] Document exact toolchain pins: V version, `ttytm.webview` revision,
  Node version, and native Linux packages.

### Frontend Robustness

- [ ] Update the outdated `backend.js` header comment that still says the
  counter has no V counterpart.
- [ ] Validate numeric bridge results in `backend.js` so malformed counter
  payloads cannot propagate `NaN` into the UI.
- [ ] Make `BackendStatus` refresh resilient to partial failure instead of
  aborting system, status, and timestamp updates on the first error.
- [ ] Add frontend unit tests for bridge unwrapping, backend failures, and
  strict-mock mode with `__PREACT_MOCK_BRIDGE__ = false`.
- [ ] Clean stale sourcemaps from `frontend-preact/public/assets` during
  production builds.
- [ ] Rewrite `frontend-preact/README.md` for the toolkit shell instead of the
  old TodoMVC demo, and rename the generic `frontend-exploration-of-preact`
  package.

### Repository Hygiene

- [ ] Track `frontend-preact/` in git; it is currently untracked while
  `node_modules`, `dist`, and generated assets remain ignored.
- [ ] Archive legacy `ui/` under `archive/svelte-view/` or remove it, then
  delete unused `inline.cjs`.
- [ ] Update `v.mod`, `README.md`, and `.gitignore` after the legacy frontend
  decision so Svelte is no longer described as current.
