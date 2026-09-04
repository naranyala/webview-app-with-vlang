# Documentation

This directory describes the current V + Preact application. The root
[`README.md`](../README.md) is the quickest route to prerequisites and startup;
these pages document the boundaries and operational details.

## Guides

- [Architecture](architecture.md): process topology, frontend shell, plugins,
  and build output.
- [Bridge API](bridge-api.md): native bindings, request conventions, response
  envelopes, and errors.
- [Storage and Export](storage-and-export.md): Quiz persistence, browser data,
  search, and PDF behavior.
- [Development](development.md): local setup, validation commands, benchmarks,
  and release limitations.

## Source of Truth

- Native startup: `main.v`, `config.v`, and `server.v`.
- Native capabilities: `bridge.v`, `plugins.v`, and `quiz_storage.v`.
- Canonical UI: `frontend-preact/`.
- Legacy reference UI: `ui/`; it is not part of the root production build.
