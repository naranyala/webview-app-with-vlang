# Development TODOs

## Phase 1: Stabilize Foundation

- [x] Add a backend configuration layer for ports, dev mode, window size, and debug logging.
- [x] Replace the fixed 300 ms server delay with a readiness check.
- [x] Bind the production HTTP server to `127.0.0.1` instead of all interfaces.
- [x] Prevent path traversal in `StaticHttpHandler`.
- [ ] Add graceful shutdown for the HTTP server and webview.
- [ ] Document and automate installation of `ttytm.webview` and native Linux dependencies.
- [ ] Add backend unit tests for static-file serving and URL handling.
- [ ] Add frontend tests or at least component-level interaction tests.

## Phase 2: Improve the V-to-JavaScript API

- [ ] Create a clear API namespace instead of attaching loose functions directly to `window`.
- [x] Add TypeScript declarations for backend methods.
- [x] Define consistent request and response formats.
- [x] Add structured error responses from V.
- [x] Validate and sanitize arguments received from JavaScript.
- [ ] Add logging levels for development and production.
- [ ] Add a health/status bridge method for frontend startup checks.

## Phase 3: Build Real Backend Features

- [ ] Decide where application state should live: in-memory, SQLite, or files.
- [x] Introduce backend modules such as `app`, `server`, `handlers`, and `services`.
- [ ] Add persistence and migrations if data must survive restarts.
- [ ] Add domain models and validation.
- [ ] Add background task handling where operations may block the UI.
- [ ] Add configuration and data-directory handling per operating system.
- [ ] Add import/export or backup support if user data is involved.

## Phase 4: Build the Frontend Application

- [ ] Replace the demo page with the main product workflow.
- [ ] Create reusable components for buttons, forms, dialogs, notifications, and loading states.
- [x] Add a typed bridge client for all V calls.
- [ ] Add centralized frontend state management only when multiple screens require it.
- [ ] Handle backend unavailable, timeout, and validation states.
- [ ] Add routing if the app needs multiple screens.
- [ ] Add responsive layouts for smaller windows.
- [ ] Add keyboard navigation and accessible labels.
- [ ] Add light/dark theme support if appropriate.
- [ ] Add empty, loading, success, and error states for every major view.

## Phase 5: Packaging and Release

- [ ] Decide whether the UI should remain external or be embedded into the executable.
- [ ] If embedding is desired, integrate or remove `inline.cjs` and make it part of the build.
- [ ] Add release builds with `debug: false`.
- [ ] Add platform-specific build scripts for Linux, Windows, and macOS.
- [ ] Package native webview dependencies.
- [ ] Add application icon, metadata, versioning, and installers.
- [ ] Add CI checks for `npm run check`, frontend build, V compilation, and tests.
- [ ] Add crash reporting or diagnostic logs.
- [ ] Verify that production builds work on clean machines.

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

## Recommended First Milestone

- [x] Secure and stabilize the V server.
- [x] Add typed bridge declarations.
- [x] Separate backend code into modules.
- [ ] Replace the demo UI with one complete user workflow.
- [x] Add error and loading states.
- [ ] Add automated checks and a reproducible release build.

## Toolkit Implementation Plan

### Dependencies

- [x] Keep `ttytm.webview` for the V desktop shell.
- [x] Use V standard library APIs for basic disk scanning.
- [ ] Add platform-specific disk capacity wrappers: `statvfs` for Linux/macOS and `GetDiskFreeSpaceExW` for Windows.
- [ ] Vendor or package `miniaudio.h` for audio playback and decoding.
- [ ] Implement equalizer DSP with biquad filters or miniaudio DSP nodes.
- [ ] Consider GStreamer for advanced audio pipelines and codec support.
- [ ] Consider PipeWire or PulseAudio only for system-wide audio processing.
- [x] Use CSS, SVG, or Canvas for frontend visualizations without a chart dependency.

### Scope Decision

- [ ] Start Audio Equalizer as an application-local audio player.
- [ ] Defer system-wide equalizer support until the local player is complete.

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
- [ ] Make EQ sliders interactive.
- [ ] Debounce slider updates before calling V.
- [ ] Show active preset state.
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
- [ ] Run disk scans and audio loading as background jobs.
- [ ] Ensure long-running work never blocks the WebView UI.

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
- [x] Add note metadata and character count display.
- [x] Add client-side PDF export with `jsPDF`.
- [x] Add export success and error states.
- [ ] Persist notes through the V backend.
- [ ] Add create, rename, delete, and reorder note actions.
- [ ] Add note search and filtering.
- [ ] Add import from Markdown or plain text.
- [ ] Add PDF styling options and chained-note export.
