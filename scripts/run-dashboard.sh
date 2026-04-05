#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

if [ ! -d "$ROOT_DIR/frontend/dist" ]; then
  echo "frontend/dist not found. Run 'npm run build' in the repository root first." >&2
  exit 1
fi

exec node "$ROOT_DIR/backend/server.js"
