#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v v >/dev/null 2>&1; then
	printf 'Error: V compiler was not found in PATH.\n' >&2
	exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
	printf 'Error: npm was not found in PATH.\n' >&2
	exit 1
fi

if [[ ! -d "$ROOT_DIR/ui/node_modules" ]]; then
	printf 'Installing frontend dependencies...\n'
	npm install --prefix "$ROOT_DIR/ui"
fi

printf 'Building frontend and desktop application...\n'
v run build.vsh

printf 'Launching desktop application...\n'
exec "$ROOT_DIR/webview-app"
