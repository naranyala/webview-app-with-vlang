# Documentation

This directory describes the current V + Preact application. The root
[`README.md`](../README.md) is the quickest route to prerequisites and startup;
these pages document the boundaries and operational details.

## Guides

- [Architecture](architecture.md): process topology, frontend shell, plugins,
  and build output.
- [MIR Lab](mir-lab.md): offline time-domain analysis and result reading.
- [Blender Studio](blender-studio.md): scene tracking next to mix notes.
- [Bridge API](bridge-api.md): native bindings, request conventions, response
  envelopes, and errors.
- [Storage and Export](storage-and-export.md): Quiz persistence, browser data,
  search, and PDF behavior.
- [Development](development.md): local setup, validation commands, benchmarks,
  and release limitations.

## Source of Truth

- Native startup: `main.v`, `config.v`, and `server.v`.
- Native capabilities: `bridge.v`, `studio_assets.v`, `studio_mir.v`,
  `plugins.v`, and `quiz_storage.v`.
- Canonical UI: `frontend-preact/`.
