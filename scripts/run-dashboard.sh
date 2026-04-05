#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_BIN="${NODE_BIN:-$(command -v node || true)}"

cd "$ROOT_DIR"

if [ ! -d "$ROOT_DIR/frontend/dist" ]; then
  echo "frontend/dist not found. Run 'npm run build' in the repository root first." >&2
  exit 1
fi

if [ -z "$NODE_BIN" ] || [ ! -x "$NODE_BIN" ]; then
  echo "Node.js binary not found. Set NODE_BIN or ensure node is in PATH." >&2
  exit 1
fi

exec "$NODE_BIN" "$ROOT_DIR/backend/server.js"
