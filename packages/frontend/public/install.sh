#!/usr/bin/env bash
set -Eeuo pipefail
MODE=check
ASSUME_YES=0
INSTALL_DIR="${MYDASH_DIR:-$PWD/mydash-vps}"
REPO_URL="${MYDASH_REPO:-https://github.com/akaanakbaik/mydash-vps.git}"
BRANCH="${MYDASH_BRANCH:-main}"
PORT="${MYDASH_PORT:-4300}"
log() { printf '[mydash] %s\n' "$*"; }
warn() { printf '[mydash][warning] %s\n' "$*" >&2; }
fail() { printf '[mydash][error] %s\n' "$*" >&2; exit "${2:-1}"; }
have() { command -v "$1" >/dev/null 2>&1; }
value_or_na() { [ -n "${1:-}" ] && printf '%s' "$1" || printf '%s' 'Not available'; }
valid_port() { case "$1" in ''|*[!0-9]*) return 1 ;; esac; [ "$1" -ge 1 ] && [ "$1" -le 65535 ]; }
while [ "$#" -gt 0 ]; do
  case "$1" in
    --check) MODE=check ;;
    --install) MODE=install ;;
    --yes|--non-interactive) ASSUME_YES=1 ;;
    --dir) shift; INSTALL_DIR="${1:?missing directory}" ;;
    --repo) shift; REPO_URL="${1:?missing repository}" ;;
    --branch) shift; BRANCH="${1:?missing branch}" ;;
    --port) shift; PORT="${1:?missing port}" ;;
    --help)
      printf '%s\n' 'MyDash installer' 'Usage: curl -fsSL https://HOST/install.sh | bash -s -- --check' '       curl -fsSL https://HOST/install.sh | bash -s -- --install --yes' 'Options: --check --install --yes --dir PATH --repo URL --branch NAME --port NUMBER'
      exit 0
      ;;
    *) fail "Unknown option: $1" 2 ;;
  esac
  shift
done
valid_port "$PORT" || fail "Port must be an integer from 1 to 65535: $PORT" 2
os_name=Unknown
os_version=Unknown
os_id=unknown
if [ -r /etc/os-release ]; then
  . /etc/os-release
  os_name="${PRETTY_NAME:-${NAME:-Linux}}"
  os_version="${VERSION_ID:-Unknown}"
  os_id="${ID:-linux}"
elif [ "$(uname -s 2>/dev/null || true)" = Darwin ]; then
  os_name='macOS'
  os_version="$(sw_vers -productVersion 2>/dev/null || true)"
  os_id=macos
elif [ "$(uname -s 2>/dev/null || true)" = Linux ]; then
  os_name=Linux
  os_id=linux
fi
kernel="$(uname -sr 2>/dev/null || true)"
architecture="$(uname -m 2>/dev/null || true)"
cores="$(getconf _NPROCESSORS_ONLN 2>/dev/null || true)"
virtualization='Not available'
if have systemd-detect-virt; then virtualization="$(systemd-detect-virt 2>/dev/null || true)"; fi
if [ -z "$virtualization" ] || [ "$virtualization" = none ]; then virtualization='bare-metal-or-unknown'; fi
filesystem='Not available'
disk_total='Not available'
disk_used='Not available'
disk_available='Not available'
disk_percent='Not available'
disk_mount='Not available'
if have df; then
  disk_line="$(df -PT . 2>/dev/null | awk 'NR==2 {print $2, $3, $4, $5, $6, $7}')"
  read -r filesystem disk_total disk_used disk_available disk_percent disk_mount <<EOF
$disk_line
EOF
fi
memory='Not available'
swap='Not available'
if [ -r /proc/meminfo ]; then
  memory="$(awk '/MemTotal:/ {printf "%.0f MB", $2/1024}' /proc/meminfo)"
  swap="$(awk '/SwapTotal:/ {printf "%.0f MB", $2/1024}' /proc/meminfo)"
elif [ "$os_id" = macos ] && have sysctl; then
  memory="$(sysctl -n hw.memsize 2>/dev/null | awk '{printf "%.0f MB", $1/1048576}')"
  swap="$(sysctl -n vm.swapusage 2>/dev/null || true)"
fi
firewall='Not available'
if have ufw; then ufw_state="$(ufw status 2>/dev/null | head -1 || true)"; case "$ufw_state" in *Error*|*error*) firewall='Not available' ;; *) firewall="ufw $ufw_state" ;; esac; elif have firewall-cmd; then firewall="firewalld $(firewall-cmd --state 2>/dev/null || true)"; elif have pfctl; then firewall="pf $(pfctl -s info 2>/dev/null | head -1 || true)"; fi
docker_status='missing'
compose_status='missing'
if have docker; then docker_status="$(docker info >/dev/null 2>&1 && printf ready || printf installed-but-not-running)"; fi
if docker compose version >/dev/null 2>&1; then compose_status="$(docker compose version --short 2>/dev/null || printf 'docker compose')"; elif have docker-compose; then compose_status='docker-compose-legacy'; fi
port_status=available
if have ss && ss -lnt 2>/dev/null | awk '{print $4}' | grep -Eq ":${PORT}$"; then port_status=in-use; elif have lsof && lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then port_status=in-use; fi
printf '%s\n' 'MyDash preflight scan'
printf '%-22s %s\n' 'OS' "$(value_or_na "$os_name")" 'OS version' "$(value_or_na "$os_version")" 'Kernel' "$(value_or_na "$kernel")" 'Architecture' "$(value_or_na "$architecture")" 'CPU cores' "$(value_or_na "$cores")" 'Virtualization' "$(value_or_na "$virtualization")" 'Filesystem' "$(value_or_na "$filesystem")" 'Disk mount' "$(value_or_na "$disk_mount")" 'Disk total' "$(value_or_na "$disk_total")" 'Disk used' "$(value_or_na "$disk_used")" 'Disk available' "$(value_or_na "$disk_available")" 'Disk usage' "$(value_or_na "$disk_percent")" 'Memory' "$(value_or_na "$memory")" 'Swap' "$(value_or_na "$swap")" 'Firewall' "$(value_or_na "$firewall")" 'Docker' "$docker_status" 'Compose' "$compose_status" "Port $PORT" "$port_status"
if [ "$MODE" = check ]; then
  if [ "$docker_status" = ready ] && [ "$compose_status" != missing ]; then
    log 'Result: compatible for Docker Compose deployment.'
  else
    log 'Result: scan completed. Install Docker Engine plus Compose on Linux, or Docker Desktop on macOS/Windows, before --install.'
  fi
  exit 0
fi
[ "$docker_status" = ready ] || fail 'Docker Engine/Desktop is required and must be running. No package manager changes were made.' 3
[ "$compose_status" != missing ] || fail 'Docker Compose is required. No package manager changes were made.' 3
have git || fail 'Git is required for repository synchronization.' 3
if [ "$port_status" = in-use ] && [ "$ASSUME_YES" -ne 1 ]; then
  printf 'Port %s is already in use. Continue without changing the existing listener? [y/N] ' "$PORT"
  read -r answer
  [ "$answer" = y ] || exit 4
fi
mkdir -p "$(dirname "$INSTALL_DIR")"
if [ -d "$INSTALL_DIR/.git" ]; then
  log 'Synchronizing existing checkout.'
  git -C "$INSTALL_DIR" fetch --depth=1 origin "$BRANCH"
  git -C "$INSTALL_DIR" checkout "$BRANCH"
  git -C "$INSTALL_DIR" reset --hard "origin/$BRANCH"
elif [ -e "$INSTALL_DIR" ]; then
  fail "Install directory exists and is not a git checkout: $INSTALL_DIR" 5
else
  log 'Cloning MyDash repository.'
  git clone --depth=1 --branch "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
fi
cd "$INSTALL_DIR"
[ -f docker-compose.yml ] || fail 'docker-compose.yml was not found after repository sync.' 6
if [ ! -f .env ]; then cp .env.example .env 2>/dev/null || : > .env; fi
if grep -q '^BACKEND_PORT=' .env; then sed -i.bak "s/^BACKEND_PORT=.*/BACKEND_PORT=$PORT/" .env; else printf '\nBACKEND_PORT=%s\n' "$PORT" >> .env; fi
rm -f .env.bak
log 'Building and starting MyDash containers.'
docker compose up -d --build
docker compose ps
log 'Install completed. Use docker compose ps and docker compose logs -f backend for diagnostics.'
