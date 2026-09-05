# Implementation Backlog — Offline Studio for Blender + MIR

Reconciled against source on 2026-09-05. This is the current tracker. Checked
items mean implemented; verification results are recorded at the bottom.
The [historical backlog](docs/backlog-history.md) preserves pre-studio ideas
without treating stale checkboxes as truth.

Focus: a local-first desktop companion for Blender 3D editing and audio/Music
Information Retrieval work. Everything below serves capture → analyze → recall
for `.blend`, renders, samples, and research — with no cloud dependency.

## Current Capability Map

| Tool | Working today | Remaining boundary |
| --- | --- | --- |
| Production Log | Native JSON CRUD, browser IndexedDB fallback, search, Q&A import, Markdown and PDF/print | No browser/native migration or close/crash recovery |
| Shots & Tasks | Editing, completion, filters, due dates, calendar, IndexedDB | No native repository or synchronization |
| Drills | Native collection/question CRUD, practice and editing | Browser changes and practice progress are not durable |
| Research Desk | Structured reader, references/citations, image library, statistics, PDF/print | No imported-PDF reader; figures omitted from exported document |
| Asset Scanner | Studio volumes, local job states, Blender/audio/render classification | No real filesystem traversal, SQLite cache, or cancellation service yet |
| MIR Workbench | Bands/presets plus tempo/key/loudness/chroma summaries and mix scoring | No playback device, decoding, or measured DSP yet |
| MIR Lab | Native V RMS/peak/ZCR core with JS mirror, demo tone + file analysis, log export | No FFT yet; chroma/tempo stay placeholder |
| Blender Studio | Scene/engine/stage tracking with validation, persistence, log export | No native scene store or `.blend` header parsing yet |

## P0 — Data Safety and Build Reliability

- [x] R01: Flush pending native note edits on selection and component unmount.
  Serialize writes so a slower old write cannot overtake a newer write within
  the workspace. Add navigation, unmount, ordering and error regression tests.
- [ ] R02: Add application-wide save coordination and close protection. Native
  close now awaits registered workspace flushers, but still needs dirty/saving/
  failed states, explicit retry, and crash recovery. Recover a local draft after
  crashes; test rapid workspace reopening, closing during save, backend timeout,
  and disk-full failures.
- [x] R03: Use `npm ci --no-bin-links` consistently in root build/test commands;
  remove silent `npm install` fallback and the incomplete-node_modules shortcut.
  `run.sh` delegates installation to the same build path.
- [x] R04: Make `build.vsh run` execute the built binary as documented.
- [x] R05: Resolve both native stores through `storage_paths.v`. Preserve default
  config paths and apply `WEBVIEW_APP_DATA_DIR` to Notes and Quiz; test isolation.
- [ ] R06: Harden native persistence. This pass added nanosecond-based generated
  IDs, duplicate-ID validation, defensive Quiz list snapshots, and pre-decode
  size limits. Remaining work is safe concurrent instances, unique temporary
  files, explicit durability guarantees, and broader failure tests.
- [ ] R07: Recover storage failures without silently losing newer data. Show
  IndexedDB/fallback mode, quota/migration errors and retry controls; reconcile
  fallback writes before returning to IndexedDB. Test corruption, failed migration,
  empty collections, large audio assets and restore from the retained legacy backup.
- [ ] R08: Define native/browser import policy. Provide preview, backup, explicit
  conflict handling, repeatable IDs and idempotent imports. Never overwrite the
  native store automatically just because browser records exist.
- [ ] R09: Add studio session memory: reopen the last shot, sample, scroll position,
  and workspace; show a topbar dirty/saving/failed pill wired to the autosave
  registry; keep a crash-draft for the Production Log.

## P1 — Runtime and Bridge Correctness

- [x] N01: Keep V bridge registration, adapter and declarations aligned (29 names,
  including studio volumes, asset-scan jobs, audio metadata, placeholder spectral
  features, and real time-domain `mir_analyze`).
- [x] N02: Retain argument validation, structured errors, status checks and an
  eight-second frontend timeout; counter and bridge helpers have tests.
- [ ] N03: Centralize the bridge method contract with request/response schemas,
  stable error codes and version/capability metadata. Check actual signatures and
  reject malformed object as well as string payloads. Cover every binding end to
  end, including the six new studio bindings.
- [ ] N04: Make strict browser mode consistent across every adapter method. Use
  one timestamp format and distinguish unavailable, mocked and native capabilities.
  Refresh status fields independently so a partial failure preserves useful data.
- [x] N05: Serve loopback-only frontend files with method checks, decoding, MIME
  types and traversal protection. HEAD responses now omit success and error bodies.
- [ ] N06: Own the HTTP server lifecycle in the application. Require a successful
  response from this launch in the readiness probe; surface bind conflicts and
  bound startup time. Stop/join the server on exit and handle termination signals.
- [ ] N07: Make port, development URL, window settings and asset location explicit
  runtime configuration. Verify moved binaries, missing index.html, occupied ports
  and independent development checkouts.
- [ ] N08: Validate WebView creation; consolidate GTK dispatch and implement/test
  native window controls on macOS and Windows.
- [ ] N09: Define external navigation policy and CSP compatible with inline bundles,
  StyleX, Blob images and PDF rendering; add localhost origin/token protection as
  part of server identity work.
- [ ] N10: Add log levels and diagnostic output with actionable storage/startup
  failures. Avoid logging private note bodies.

## P1 — Studio Tools (Blender + MIR first)

- [ ] T01: Persist browser Drill decks and session progress through a repository;
  seed Blender-shortcut, VSE-editing, interval/chord, and tempo decks. Test reload
  and workspace switching.
- [ ] T02: Add a native Shots repository for Blender shots and mix tasks only after
  the migration policy (R08) is set. Preserve IDs, due dates and completed states.
- [ ] T03: Finish Production Log workflow: retry/save status, shot-linked entries,
  Markdown/plain-text file import, and chained-note export. Preserve paste import
  and delete behavior.
- [ ] T04: Cover Drills editing/session navigation, Research Desk submenus,
  Reference Manager, image upload/remove, calendar interaction, Asset Scanner
  progress, MIR analysis/error states, and export failures with component tests.
- [ ] T05: Add shared accessible field/error/status/button components where repeated
  behavior warrants them. Audit keyboard navigation, focus restoration and narrow
  windows.
- [ ] T06: Decide Research Desk import scope: the structured sample reader is not a
  general PDF reader. An empty library needs a supported create/import path before
  the MIR literature workflow is declared complete.
- [ ] T07: Add studio navigation convenience: `Ctrl+K` command palette jumping to
  shots, samples, papers, and drills, plus deep-linkable hash routes so views can
  be shared from screen recordings and notes.

## P1 — Export, Assets and Backup

- [ ] E01: Define an export document model shared by preview, print and PDF
  rendering, plus studio cue sheets / shot lists. Preserve citation numbering,
  headings, lists and code blocks across renderers.
- [ ] E02: Connect figures to paper sections and include them with captions in print
  and download output. Verify corrupt/large images, sizing and multi-page output.
- [ ] E03: Add a native save dialog with cancellation and chosen destination; preserve
  the current Documents export until the replacement is tested on target platforms.
- [ ] E04: Implement versioned backup/import archives for production logs, shots,
  drills, papers, references, studio assets, audio features and Blobs. Preview
  import, validate limits, back up current data, test restore into an empty profile.
- [ ] E05: Add reference import/export (BibTeX/CSL) for MIR literature when formats
  are chosen. Include citation-key search and a "cite this paper in Production
  Log" action. Keep generated HTML escaped or sanitize before rendering.
- [ ] E06: Export studio cue sheets (PDF/CSV) and Blender VSE edit lists from the
  shared export document model, reusing shot timings and audio-feature metadata.

## P2 — Real Asset Scanner (Before Full MIR DSP)

- [ ] D01: Define Blender/sample/render volume and directory-selection contracts;
  implement Linux first, then macOS/Windows capacity wrappers and native dialogs.
- [ ] D02: Implement a bounded background job service with IDs, state transitions,
  cancellation, throttled progress, errors and cleanup. Keep work off the UI thread.
- [ ] D03: Scan a selected root using V filesystem APIs; aggregate bytes, sort largest
  entries, classify `.blend`/audio/render files, handle permissions, symlink cycles
  and disappearing files. Test on fixture trees including unreadable paths.
- [x] D04 (partial): `list_volumes`, `start_asset_scan`, `get_asset_scan_status`,
  `cancel_asset_scan` contracts, validation, adapter methods and local UI states
  exist. Still needs real traversal, adapter tests against native jobs, and error
  states wired to the service in D02/D03.
- [ ] D05: Remove simulated batches from native mode after fixture and manual
  large-library validation. Add SQLite caching only after a measured requirement.
- [ ] D06: Make the scanner Blender-aware: parse `.blend` headers for version,
  index linked libraries, capture render thumbnails, reveal entries in the file
  manager, and persist per-project shot lists (`shots.json`) with stable IDs.

## P2 — Real MIR Workbench

- [ ] A01: Confirm application-local player scope and supported codecs/platforms;
  leave system-wide processing as a separate future project.
- [ ] A02: Choose/package an audio backend after a build/license check; implement
  file selection, decoding, device initialization, play/pause/stop and cleanup.
- [ ] A03: Implement one biquad band, test its frequency response, then expand to
  seven bands with gain limits, presets and safe real-time parameter updates.
- [ ] A04: Bind playback state, position, duration and optional peak/RMS meters;
  debounce controls and test unsupported formats, missing devices and track switching.
- [x] A05 (partial): Real time-domain `mir_analyze` core (V `mir_core.v` +
  JS mirror, bounded windows, parity tests) is done; `get_audio_metadata` /
  `analyze_audio` placeholder contracts, mock spectral documents, mix-similarity
  scoring and feature persistence remain until measured tempo/key/chroma/MFCC DSP
  and level meters land.
- [ ] A06: Build MIR convenience views: waveform + spectrogram/chromagram canvas,
  loop region with A/B compare, BPM/key library filtering, near-duplicate detection
  via MFCC distance, and auto-tag sidecar JSON for samples.

## P2 — Abstraction and Maintainability

The detailed boundaries and migration order are in
[docs/abstraction-plan.md](docs/abstraction-plan.md). Apply these incrementally;
keep compatibility tests around existing bridge names and persisted formats.

- [x] L01: Extract a pure ordered autosave coordinator with focused tests.
- [x] L02: Share native storage-directory resolution without moving existing data.
- [ ] L03: Introduce tool repositories (Production Log first) so components do not
  select native versus browser persistence. Share native coordination across mounts.
- [ ] L04: Split bridge transport from typed domain clients and browser mocks;
  move native bindings by domain only once the contract checker is authoritative.
- [ ] L05: Extract an atomic-file utility while preserving store-owned validation,
  locking and rollback. Keep Notes/Quiz models separate; avoid a generic CRUD engine.
- [ ] L06: Add AppRuntime ownership for config, server, stores, jobs and shutdown;
  introduce platform adapters for window/dialog/volume/audio capabilities.
- [ ] L07: Separate document normalization from renderers and export destinations.
- [ ] L08: Add plugin lifecycle/capability metadata and enable/disable configuration
  when needed. Defer runtime external plugins until discovery and trust are specified.
- [ ] L09: Extract shared state, virtual lists or popovers only after a demonstrated
  cross-component need or measured bottleneck. Keep search/PDF benchmarks as evidence.

## P2 — Build, Packaging and Repository Hygiene

- [ ] B01: Pin and record a supported V/WebView/Node/native-library matrix. Verify
  clean installation and native linking; align package metadata and dependency lists.
- [ ] B02: CI workflow exists (deps check, `build.vsh test`, `build.vsh`); still
  needs V formatting/vet gates and a passing clean-machine run to close out.
- [ ] B03: Package executable plus frontend assets and native dependencies; add icons,
  application metadata, versioning and installers. Test an installed build outside
  the checkout on each claimed platform with production debug disabled.
- [ ] B04: Add build `frontend` alias, explicit clean targets and test discovery.
  Stale `public/assets/*.map` files are now auto-cleaned on non-watch builds.
- [x] B05: Removed legacy `ui/` Svelte app and `inline.cjs`; renamed the frontend
  package to `studio-companion-preact` and aligned the lockfile.
- [ ] B06: Declare a project license and record dependency licenses, purpose, native
  requirements and measured bundle impact; remove unused dependencies after review.
- [x] B07: Reconcile current README/storage/architecture docs and preserve the old
  backlog separately so completed work is not repeatedly proposed as missing.

## Validation and Immediate Follow-up

Completed implementation checkboxes above do not imply release readiness.

Confirmed in this session:

- [x] Biome passed (52 files), and binding consistency passed (29 names).
- [x] All 13 frontend Node test files and all 5 component tests passed, including
  asset/MIR/blender contracts, time-domain parity, autosave, and note-navigation
  regressions.
- [x] Backend bridge, plugin, Notes, Quiz, shared storage-path, studio, and log
  validation test files passed.
- [x] `git diff --check` passed.
- [x] Cloned the sibling's best parts: dedicated MIR Lab + Blender Studio plugins,
  real `mir_analyze` core with JS mirror, Blender scene module, leveled logging,
  plugin-ID validation, `tools/check-deps.sh`, CI workflow, and MIR/Blender docs.
  Pure modules (`mir_core.v`, `mir.mjs` core, `blender.mjs`) stay UI- and
  transport-free for the future shared C/JS libraries.

Finish these before treating this change as fully verified:

- [x] V01: Fixed Result handling in the HEAD regression test by unwrapping header
  values before assertions. `v test server_test.v` passes.
- [ ] V02: Verify formatting of changed V files. Run `v fmt -verify` and resolve
  any remaining differences.
- [ ] V03: Complete native compilation (`v -o webview-app .`).
- [ ] V04: Exercise the revised root build/test scripts, including locked install
  failure and `build.vsh run` using the compiled executable.
- [ ] V05: Manually test asset-scan flows, MIR analysis states, note switching,
  workspace reopening, failed writes, native exports and window controls in the GUI.
- [ ] V06: Validate process-close durability and packaged cross-platform behavior
  only after R02/N06/B03 are implemented.

## Future Projection — Where This Desktop App Is Headed

North star: one offline window where Blender shots and audio analysis live
together. The loop is capture → analyze → recall: log a scene or mix move,
measure it locally, find it again in seconds, export it as a cue sheet, PDF,
or edit list. No account, no upload, no network dependency — large `.blend`
files, stems, and datasets never leave the machine.

### Horizon 1 — Finish the foundation (current open items)

- Durability and lifecycle first: R02 (save coordination + crash drafts),
  R06 (concurrent instances, temp-file uniqueness, durability guarantees),
  N06 (server ownership + shutdown), R07 (storage recovery UI). Nothing in
  Horizons 2–3 is shippable without these.
- Real Asset Scanner: D02 job service + D03 filesystem traversal + D06
  `.blend` awareness, with D05 removing simulated batches only after fixture
  and large-library validation.
- Real MIR playback: A02 device/backend + A04 transport/meters, keeping
  analysis dry while monitoring is shaped (A01 scope).
- Shared-library extraction — the explicit trigger for the planned split:
  - `studio-c-core` (C ABI): port `mir_core.v` + the sibling's `mir.zig`
    behind one header (`rms`, `peak`, `zcr`, bounded `analyze`, error codes).
    Extract when the KissFFT spectral step lands, so both shells consume one
    implementation instead of three mirrors.
  - `studio-js-kit` (ESM): publish `mir.mjs` core + `blender.mjs` + schemas
    as versioned modules once a second consumer exists (today there are two
    checkouts with copied files — that is the migration signal, not the start).
  - Until then: no new copies. Every pure helper lands in the marked
    transport-free sections so extraction stays mechanical.

### Horizon 2 — The connected studio (projects, sessions, literature)

- Project system: per-project `shots.json` (D06) linking Blender scenes,
  samples, tasks, and log entries; scene-linked audio results (S04) give one
  shared timeline for "onset → cut, RMS → lighting energy".
- Session memory (R09): reopen last shot/sample/scroll/workspace, topbar
  dirty-state pill, crash drafts. Session snapshot export (S05) bundles
  notes + tasks + MIR results + scene list into one timestamped PDF.
- Search and command: studio tag search across notes/scenes/samples/papers
  (S07) plus `Ctrl+K` palette and deep-linkable routes (T07); drag-and-drop
  audio/`.blend` with a surviving recent-files rail (S01).
- MIR depth: batch folder analysis to JSON/CSV sidecars (S02), A/B compare
  with delta readout (S03), loudness guardrails before logging (S09),
  BPM/key filtering and MFCC near-duplicate detection (A06), spectral
  features via the shared C core.
- Knowledge loop: durable drill progress (R05/T01) with Blender-shortcut,
  VSE, interval/chord, and tempo decks; Research Desk import scope settled
  (T06) with BibTeX and cite-in-log (E05); cue sheets and VSE edit lists
  from the shared export model (E06).
- Storage on demand: SQLite/FTS5 only when folder workflows outgrow JSON,
  with a measured cache-hit speedup as the entry ticket (S10, D05).

### Horizon 3 — Hardened local product

- Release: pinned matrix (B01), green clean-machine CI (B02), installers +
  icons + metadata (B03), license inventory (B06), finished V02–V06 checks.
- Platform parity: Linux first, then macOS/Windows window controls (N08),
  dialogs, volume enumeration (D01), and audio backends (A02) behind platform
  adapters (L06) — unsupported capabilities stay explicit in the UI (R12).
- Trust: localhost/server identity (N09), CSP verified in the WebView (R15),
  actionable diagnostics without logging private bodies (N10).
- Performance: shared shell controls, theme tokens, virtualized libraries
  (L09/R19) only after measured bottlenecks; benchmarks stay as evidence.
- Optional local intelligence: bundled on-device models (onset/beat/key)
  running through the shared C core — still offline, still no cloud. Cloud
  sync, if ever proposed, must arrive as explicit export/import (E04), never
  silent divergence (R08).

### Target shape (when Horizons 1–2 land)

```text
Studio shell (launcher, palette, topbar save state)
  -> tool workspaces (MIR Lab, Blender Studio, Log, Shots, Drills, Research)
    -> domain repositories (scenes, samples+features, notes, tasks, papers)
      -> native domain clients OR browser Dexie repositories
        -> bridge transport (window.*) OR local adapters

V backend: AppRuntime owns config, server, stores, jobs, shutdown
  platform adapters: window / dialog / volume / audio
  shared studio-c-core: time-domain now, spectral next

Persistence: versioned JSON first (notes, quizzes, shots, sidecars),
  SQLite only for measured scan/search caches, backups as archives (E04)
```

### Non-goals (protect the focus)

- System-wide audio processing; the player stays application-local.
- Cloud accounts, sync, or telemetry of any kind.
- A generic third-party plugin marketplace; lifecycle metadata (L08) serves
  first-party enable/disable only.
- Mobile ports; the shell assumes a desktop WebView with local filesystem.

### Milestones and exit criteria

1. **M1 Durable core**: R02 + R06 + R07 + N06 closed; V02–V04 green; kill the
   process mid-save in manual testing without losing acknowledged writes.
2. **M2 Real scanner**: D02 + D03 + D06 done; D05 simulation removed; a
   10k-file fixture scans, cancels, and restarts cleanly.
3. **M3 Audible bench**: A02 + A04 done; measured meters replace simulation;
   device/format failures are tested, not just mocked.
4. **M4 Measured MIR**: shared C core extracted with spectral features; A05 +
   A06 done; sidecars (S02) and A/B compare (S03) work on real stems.
5. **M5 Connected project**: shots.json + S04 + S05 + E06 + T07 done; one
   command turns a session into a cue sheet a collaborator can read.
6. **M6 Release**: B01–B03 + N08–N10 done; installed build on a clean machine
   outside the checkout with production debug disabled.
