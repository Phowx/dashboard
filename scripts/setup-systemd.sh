#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_NAME="dashboard"
INSTALL_DIR="$ROOT_DIR"
SERVICE_USER="${SUDO_USER:-${USER:-}}"
SERVICE_GROUP=""
SKIP_INSTALL=0
SKIP_BUILD=0
WRITE_ONLY=0

usage() {
  cat <<'EOF'
Usage: ./scripts/setup-systemd.sh [options]

Options:
  --service-name NAME   systemd service name, default: dashboard
  --install-dir PATH    deployed repository path, default: current repository
  --service-user USER   user that runs the service, default: current user
  --service-group NAME  group that runs the service, default: user's primary group
  --skip-install        skip npm dependency installation
  --skip-build          skip frontend build
  --write-only          only write the unit file, do not enable/start service
  -h, --help            show this help message
EOF
}

log() {
  printf '[setup] %s\n' "$*"
}

warn() {
  printf '[warn] %s\n' "$*" >&2
}

die() {
  printf '[error] %s\n' "$*" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

while [ $# -gt 0 ]; do
  case "$1" in
    --service-name)
      SERVICE_NAME="${2:-}"
      shift 2
      ;;
    --install-dir)
      INSTALL_DIR="${2:-}"
      shift 2
      ;;
    --service-user)
      SERVICE_USER="${2:-}"
      shift 2
      ;;
    --service-group)
      SERVICE_GROUP="${2:-}"
      shift 2
      ;;
    --skip-install)
      SKIP_INSTALL=1
      shift
      ;;
    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    --write-only)
      WRITE_ONLY=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Unknown option: $1"
      ;;
  esac
done

[ -n "$SERVICE_NAME" ] || die "Service name cannot be empty"
[ -n "$SERVICE_USER" ] || die "Service user cannot be empty. Use --service-user."

if [ -z "$SERVICE_GROUP" ]; then
  SERVICE_GROUP="$(id -gn "$SERVICE_USER" 2>/dev/null || true)"
fi

[ -n "$SERVICE_GROUP" ] || die "Service group cannot be resolved. Use --service-group."

if [ "$(uname -s)" != "Linux" ]; then
  die "This script only supports Linux with systemd."
fi

need_cmd systemctl
need_cmd node
need_cmd npm
need_cmd install

[ -f "$ROOT_DIR/backend/server.js" ] || die "Run this script from the dashboard repository."
[ -d /etc/systemd/system ] || die "/etc/systemd/system does not exist."

if ! systemctl --version >/dev/null 2>&1; then
  die "systemctl is installed but systemd does not appear to be available."
fi

if ! id "$SERVICE_USER" >/dev/null 2>&1; then
  die "User '$SERVICE_USER' does not exist on this machine."
fi

if ! getent group "$SERVICE_GROUP" >/dev/null 2>&1; then
  die "Group '$SERVICE_GROUP' does not exist on this machine."
fi

if [ ! -d "$INSTALL_DIR" ]; then
  die "Install directory does not exist: $INSTALL_DIR"
fi

if [ "$INSTALL_DIR" != "$ROOT_DIR" ]; then
  warn "Install directory differs from current repository: $INSTALL_DIR"
  warn "The script will use the install directory as the deployment source."
fi

[ -f "$INSTALL_DIR/backend/server.js" ] || die "backend/server.js not found under $INSTALL_DIR"
[ -f "$INSTALL_DIR/package.json" ] || die "package.json not found under $INSTALL_DIR"

RUN_SCRIPT="$INSTALL_DIR/scripts/run-dashboard.sh"
UNIT_PATH="/etc/systemd/system/${SERVICE_NAME}.service"
NODE_BIN="$(command -v node)"
NODE_PATH_VALUE="$(dirname "$NODE_BIN"):/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
DOCKER_SOCKET="/var/run/docker.sock"

log "Environment summary"
printf '  OS: %s\n' "$(grep '^PRETTY_NAME=' /etc/os-release 2>/dev/null | cut -d= -f2- | tr -d '"' || uname -sr)"
printf '  systemd: %s\n' "$(systemctl --version | head -n1)"
printf '  node: %s (%s)\n' "$("$NODE_BIN" --version)" "$NODE_BIN"
printf '  npm: %s\n' "$(npm --version)"
printf '  repo root: %s\n' "$ROOT_DIR"
printf '  install dir: %s\n' "$INSTALL_DIR"
printf '  service: %s\n' "$SERVICE_NAME"
printf '  user/group: %s:%s\n' "$SERVICE_USER" "$SERVICE_GROUP"
printf '  unit path: %s\n' "$UNIT_PATH"

if [ -S "$DOCKER_SOCKET" ]; then
  SOCKET_GROUP="$(stat -c '%G' "$DOCKER_SOCKET" 2>/dev/null || true)"
  if id -nG "$SERVICE_USER" | tr ' ' '\n' | grep -qx "${SOCKET_GROUP:-}"; then
    log "Docker socket detected and '$SERVICE_USER' already belongs to group '$SOCKET_GROUP'."
  else
    warn "Docker socket detected at $DOCKER_SOCKET."
    warn "User '$SERVICE_USER' may need access to group '$SOCKET_GROUP' to read container status."
  fi
else
  warn "Docker socket not found at $DOCKER_SOCKET. Docker container metrics may be unavailable."
fi

if [ ! -x "$RUN_SCRIPT" ]; then
  if [ -f "$RUN_SCRIPT" ]; then
    chmod +x "$RUN_SCRIPT"
  else
    die "Run script not found at $RUN_SCRIPT"
  fi
fi

if [ "$SKIP_INSTALL" -eq 0 ]; then
  log "Installing dependencies"
  (cd "$INSTALL_DIR" && npm run install:all)
else
  log "Skipping dependency installation"
fi

if [ "$SKIP_BUILD" -eq 0 ]; then
  log "Building frontend"
  (cd "$INSTALL_DIR" && npm run build)
else
  log "Skipping frontend build"
fi

if [ ! -d "$INSTALL_DIR/frontend/dist" ]; then
  die "frontend/dist not found under $INSTALL_DIR"
fi

TMP_UNIT="$(mktemp)"
cat > "$TMP_UNIT" <<EOF
[Unit]
Description=Private Server Dashboard
After=network-online.target docker.service
Wants=network-online.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_GROUP
WorkingDirectory=$INSTALL_DIR
ExecStart=$RUN_SCRIPT
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=NODE_BIN=$NODE_BIN
Environment=PATH=$NODE_PATH_VALUE

[Install]
WantedBy=multi-user.target
EOF

log "Writing systemd unit to $UNIT_PATH"
if command -v sudo >/dev/null 2>&1 && [ "$(id -u)" -ne 0 ]; then
  sudo install -m 0644 "$TMP_UNIT" "$UNIT_PATH"
  sudo systemctl daemon-reload
  if [ "$WRITE_ONLY" -eq 0 ]; then
    sudo systemctl enable --now "$SERVICE_NAME"
  fi
else
  install -m 0644 "$TMP_UNIT" "$UNIT_PATH"
  systemctl daemon-reload
  if [ "$WRITE_ONLY" -eq 0 ]; then
    systemctl enable --now "$SERVICE_NAME"
  fi
fi

rm -f "$TMP_UNIT"

if [ "$WRITE_ONLY" -eq 0 ]; then
  log "Service installed and started."
  log "Check status with: sudo systemctl status $SERVICE_NAME"
  log "View logs with: sudo journalctl -u $SERVICE_NAME -f"
else
  log "Service file written only. Start it later with:"
  log "  sudo systemctl enable --now $SERVICE_NAME"
fi
