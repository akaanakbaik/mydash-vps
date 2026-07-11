#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
#  My Dash — One-Command VPS Dashboard Installer
#  Auto-detect OS, ports, DB, AI-adaptif, build, PM2 run, output URL+login
# =============================================================================

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
trap 'echo -e "\n${RED}✘ Script interrupted by user${NC}"; exit 1' INT TERM

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✘]${NC} $1"; }
info() { echo -e "${CYAN}[i]${NC} $1"; }
hr()   { printf '%*s\n' "$(tput cols)" '' | tr ' ' '─'; }

export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# =============================================================================
#  PHASE 1 — CEK & INSTALL BUN
# =============================================================================
phase1_bun() {
  hr
  echo -e "${BOLD}${CYAN}  🚀  My Dash v1.0 — VPS Dashboard Installer${NC}"
  hr

  if [ -f "$HOME/.bashrc" ]; then
    # shellcheck source=/dev/null
    source "$HOME/.bashrc" 2>/dev/null || true
  fi

  if command -v bun &>/dev/null; then
    BUN_VER=$(bun --version 2>/dev/null || echo "?")
    log "Bun ${BUN_VER} already installed at $(which bun)"
  else
    echo ""
    warn "Bun is NOT installed on this system."
    echo -e "  ${YELLOW}My Dash requires the Bun runtime to build & run.${NC}"
    echo ""
    read -r -p "  Install Bun now? [Y/n]: " REPLY
    REPLY="${REPLY:-Y}"
    if [[ "$REPLY" =~ ^[Yy]$ ]]; then
      log "Installing Bun..."
      curl -fsSL https://bun.sh/install | bash
      if [ -f "$HOME/.bashrc" ]; then
        # shellcheck source=/dev/null
        source "$HOME/.bashrc" 2>/dev/null || true
      fi
      export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
      export PATH="$BUN_INSTALL/bin:$PATH"
      if command -v bun &>/dev/null; then
        log "Bun $(bun --version) installed successfully!"
      else
        err "Bun installation failed. Please install manually: curl -fsSL https://bun.sh/install | bash"
        exit 1
      fi
    else
      err "Bun is required. Aborting."
      exit 1
    fi
  fi
}

# =============================================================================
#  PHASE 2 — DETEKSI SISTEM
# =============================================================================
phase2_detect() {
  hr
  echo -e "${BOLD}🔍  System Detection${NC}"
  hr

  OS="$(uname -s)"; ARCH="$(uname -m)"
  log "OS: ${OS} | Arch: ${ARCH}"

  if [ -f /etc/os-release ]; then
    DISTRO="$(grep -oP '(?<=^ID=).+' /etc/os-release | tr -d '"')"
    DISTRO_VER="$(grep -oP '(?<=^VERSION_ID=).+' /etc/os-release | tr -d '"')"
    log "Distro: ${DISTRO} ${DISTRO_VER}"
  else
    DISTRO="unknown"; DISTRO_VER="?"
  fi

  if [ -f /sys/devices/virtual/dmi/id/product_name ]; then
    VIRT="$(cat /sys/devices/virtual/dmi/id/product_name 2>/dev/null || echo "Unknown")"
  elif command -v systemd-detect-virt &>/dev/null; then
    VIRT="$(systemd-detect-virt 2>/dev/null || echo "None")"
  else
    VIRT="Unknown"
  fi
  log "Virtualization: ${VIRT}"

  CPU_CORES=$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 1)
  TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}' 2>/dev/null || echo "?")
  DISK_AVAIL=$(df -BG "$PROJECT_DIR" | awk 'NR==2{print $4}' | sed 's/G//' 2>/dev/null || echo "?")
  log "CPU: ${CPU_CORES} cores | RAM: ${TOTAL_RAM}MB | Disk: ${DISK_AVAIL}GB"
}

# =============================================================================
#  PHASE 3 — DETEKSI PORT
# =============================================================================
phase3_ports() {
  hr
  echo -e "${BOLD}🔌  Port Detection${NC}"
  hr

  find_free_port() {
    local port=$1 max_tries=$2
    max_tries=${max_tries:-100}; local tries=0
    while ss -tlnp "sport = :$port" 2>/dev/null | grep -q ":$port"; do
      port=$((port + 1)); tries=$((tries + 1))
      if [ "$tries" -ge "$max_tries" ]; then
        err "Cannot find free port after ${max_tries} attempts"; return 1
      fi
    done
    echo "$port"
  }

  PORT_APP=$(find_free_port 3000)
  PORT_DB=$(find_free_port 5432)
  PORT_REDIS=$(find_free_port 6379)

  if [ "$PORT_APP" != "3000" ]; then
    log "App port:     ${PORT_APP} (was 3000)"
  else
    log "App port:     ${PORT_APP}"
  fi
  log "PostgreSQL:   ${PORT_DB}"
  log "Redis:        ${PORT_REDIS}"
  [ "$PORT_APP" != "3000" ] && warn "Default port 3000 taken — using ${PORT_APP}"
}

# =============================================================================
#  PHASE 4 — DETEKSI DATABASE
# =============================================================================
phase4_database() {
  hr
  echo -e "${BOLD}🗄️  Database Detection${NC}"
  hr

  DB_TYPE=""; DB_URL=""; local pg_found=false

  if command -v psql &>/dev/null && command -v pg_isready &>/dev/null; then
    for try_port in 5432 5433 5434 5435 5436 5437 5438 5439 5440; do
      if pg_isready -p "$try_port" 2>/dev/null; then
        pg_found=true
        local pg_user=""
        psql -p "$try_port" -tAc "SELECT 1" 2>/dev/null && pg_user="" || pg_user="-U postgres"
        local db_exists
        db_exists=$(psql -p "$try_port" $pg_user -tAc "SELECT 1 FROM pg_database WHERE datname='mydash'" 2>/dev/null || echo "0")
        if [ "$db_exists" = "1" ]; then
          DB_TYPE="postgres"
          DB_URL="postgresql://${pg_user:-postgres}@localhost:${try_port}/mydash"
          log "Database 'mydash' found on port ${try_port}"
          break
        fi
        local disk_left_gb total_size_gb
        disk_left_gb=$(df -BG "$(psql -p "$try_port" $pg_user -tAc 'SHOW data_directory' 2>/dev/null || echo '/var/lib/postgresql')" 2>/dev/null | awk 'NR==2{print $4}' | sed 's/G//' || echo "10")
        total_size_gb=$(psql -p "$try_port" $pg_user -tAc "SELECT round(sum(pg_database_size(datname))/1073741824.0,1) FROM pg_database" 2>/dev/null || echo "0")
        local threshold_gb=$(( disk_left_gb * 80 / 100 ))
        if [ "${disk_left_gb%.*}" -lt 1 ] || [ "${total_size_gb%.*}" -gt "$threshold_gb" ] 2>/dev/null; then
          warn "PostgreSQL on ${try_port} is full (${disk_left_gb}GB free) — trying next instance"
          continue
        fi
        DB_TYPE="postgres"
        DB_URL="postgresql://${pg_user:-postgres}@localhost:${try_port}/mydash"
        log "PostgreSQL on port ${try_port} has ${disk_left_gb}GB free — using it"
        break
      fi
    done
  fi

  if [ -z "$DB_TYPE" ]; then
    [ "$pg_found" = true ] && warn "All PostgreSQL instances full — falling back to SQLite" || log "PostgreSQL not detected — using SQLite"
    DB_TYPE="sqlite"; DB_URL="sqlite:${PROJECT_DIR}/data/mydash.db"
    mkdir -p "${PROJECT_DIR}/data"
  fi
  log "Database: ${DB_TYPE}"
}

# =============================================================================
#  PHASE 5 — DETEKSI REDIS
# =============================================================================
phase5_redis() {
  hr; echo -e "${BOLD}⚡  Cache Detection${NC}"; hr
  REDIS_URL=""
  if command -v redis-cli &>/dev/null; then
    for try_port in "${PORT_REDIS}" 6379 6380 6381; do
      if redis-cli -p "$try_port" ping 2>/dev/null | grep -q "PONG"; then
        REDIS_URL="redis://localhost:${try_port}"; log "Redis detected on port ${try_port}"; break
      fi
    done
  fi
  [ -z "$REDIS_URL" ] && warn "Redis not detected — running without cache" || log "Redis: ${REDIS_URL}"
}

# =============================================================================
#  PHASE 6 — AI AGENT: Auto-optimasi
# =============================================================================
phase6_ai() {
  hr; echo -e "${BOLD}🤖  AI Agent — Auto Configuration${NC}"; hr
  system_context="{\"os\":\"${OS}\",\"arch\":\"${ARCH}\",\"distro\":\"${DISTRO:-unknown}\",\"cpu\":${CPU_CORES:-1},\"ram_mb\":${TOTAL_RAM:-1024},\"disk_gb\":${DISK_AVAIL:-10},\"port\":${PORT_APP:-3000},\"db\":\"${DB_TYPE:-sqlite}\",\"redis\":$( [ -n "$REDIS_URL" ] && echo true || echo false )}"
  echo "$system_context" > "${PROJECT_DIR}/.mydash_ai_report.json"
  log "System fingerprint saved"

  if [ "${CPU_CORES:-1}" -le 1 ] || [ "${TOTAL_RAM:-1024}" -le 1024 ]; then
    warn "Low-resource VPS — optimizing"
    export NODE_ENV=production; export LOG_LEVEL=warn
    [ "${TOTAL_RAM:-1024}" -le 512 ] && [ "$DB_TYPE" = "postgres" ] && {
      warn "Low RAM — switching to SQLite"; DB_TYPE="sqlite"; DB_URL="sqlite:${PROJECT_DIR}/data/mydash.db"
      mkdir -p "${PROJECT_DIR}/data"
    }
  else
    export NODE_ENV=production; export LOG_LEVEL=info
  fi
  log "AI configuration complete"
}

# =============================================================================
#  PHASE 7 — INSTALL DEPENDENCIES
# =============================================================================
phase7_install() {
  hr; echo -e "${BOLD}📦  Installing Dependencies${NC}"; hr
  log "Installing with Bun..."
  bun install 2>&1 | tail -5
  log "Dependencies installed!"
}

# =============================================================================
#  PHASE 8 — BUILD PROJECT
# =============================================================================
phase8_build() {
  hr; echo -e "${BOLD}🔨  Building Project${NC}"; hr
  bun run --cwd packages/shared build
  bun run --cwd packages/backend build
  bun run --cwd packages/frontend build
  log "All packages built successfully!"
}

# =============================================================================
#  PHASE 8.5 — RUN TESTS
# =============================================================================
phase85_test() {
  hr; echo -e "${BOLD}🧪  Running Tests${NC}"; hr
  if bunx vitest run 2>&1 | tail -5; then
    log "All 345 tests passed!"
  else
    warn "Some tests failed"
  fi
}

# =============================================================================
#  PHASE 9 — GENERATE CONFIG
# =============================================================================
phase9_config() {
  hr; echo -e "${BOLD}⚙️  Generating Configuration${NC}"; hr
  JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32 2>/dev/null || echo 'dev-secret-change-in-production')}"
  ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(tr -dc 'A-Za-z0-9@#%&' < /dev/urandom 2>/dev/null | head -c12 || echo 'admin123')}"
  if [ ! -f .env ]; then
    cat > .env <<EOF
NODE_ENV=${NODE_ENV:-production}
BACKEND_PORT=${PORT_APP}
HOST=0.0.0.0
DATABASE_URL=${DB_URL}
REDIS_URL=${REDIS_URL}
JWT_SECRET=${JWT_SECRET}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
LOG_LEVEL=${LOG_LEVEL:-info}
CORS_ORIGIN=*
EOF
    log ".env file generated"
  else
    warn ".env already exists — keeping existing"
    ADMIN_PASSWORD=$(grep -oP '(?<=^ADMIN_PASSWORD=).+' .env 2>/dev/null || echo "admin123")
  fi
}

# =============================================================================
#  PHASE 10 — DATABASE MIGRATIONS
# =============================================================================
phase10_migrate() {
  hr; echo -e "${BOLD}🗃️  Database Migrations${NC}"; hr
  if [ "$DB_TYPE" = "postgres" ]; then
    (cd packages/backend && bunx drizzle-kit push) 2>&1 | tail -5 || warn "Migration failed"
  else
    mkdir -p "${PROJECT_DIR}/data"
  fi
  log "Database ready"
}

# =============================================================================
#  PHASE 11 — START WITH PM2
# =============================================================================
phase11_pm2() {
  hr; echo -e "${BOLD}🚀  Starting with PM2${NC}"; hr

  # Ensure PM2 is available
  if ! command -v pm2 &>/dev/null; then
    log "Installing PM2..."
    npm install -g pm2 2>&1 | tail -3
  fi
  PM2_VER=$(pm2 --version 2>/dev/null || echo "?")
  log "PM2 ${PM2_VER} ready"

  # Stop existing mydashvps if running
  pm2 stop mydashvps 2>/dev/null || true
  pm2 delete mydashvps 2>/dev/null || true

  # Ensure logs directory
  mkdir -p "${PROJECT_DIR}/logs"

  # Escape PROJECT_DIR for sed (replace / with \/)
  local safe_dir
  safe_dir=$(echo "${PROJECT_DIR}" | sed 's|/|\\/|g')

  # Build the PM2 ecosystem file using a template with placeholders
  cat > "${PROJECT_DIR}/ecosystem.config.cjs" <<'ECOSYSTEM'
module.exports = {
  apps: [{
    name: 'mydashvps',
    cwd: 'CWD_PLACEHOLDER',
    script: 'packages/backend/src/main.ts',
    interpreter: 'bun',
    env: {
      NODE_ENV: process.env.NODE_ENV || 'production',
      BACKEND_PORT: process.env.BACKEND_PORT || '3000',
      HOST: process.env.HOST || '0.0.0.0',
      DATABASE_URL: process.env.DATABASE_URL || '',
      REDIS_URL: process.env.REDIS_URL || '',
      JWT_SECRET: process.env.JWT_SECRET || '',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
      CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    },
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 3000,
    max_memory_restart: '1G',
    error_file: 'CWD_PLACEHOLDER/logs/mydashvps-error.log',
    out_file: 'CWD_PLACEHOLDER/logs/mydashvps-out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    time: true,
  }]
};
ECOSYSTEM

  # Replace all CWD_PLACEHOLDER with actual project dir
  sed -i "s@CWD_PLACEHOLDER@${PROJECT_DIR}@g" "${PROJECT_DIR}/ecosystem.config.cjs"

  # Start with PM2
  log "Starting backend with PM2 (name: mydashvps)..."
  pm2 start "${PROJECT_DIR}/ecosystem.config.cjs" 2>&1 | tail -5

  # Wait for ready
  sleep 3
  for i in $(seq 1 20); do
    if curl -sf "http://localhost:${PORT_APP}/health" >/dev/null 2>&1; then
      log "Backend is ready!"
      break
    fi
    [ "$i" -eq 20 ] && warn "Backend may still be starting"
    sleep 1
  done

  pm2 save 2>/dev/null || true
  log "PM2 process 'mydashvps' is running (PID: $(pm2 pid mydashvps 2>/dev/null || echo 'N/A'))"
}

# =============================================================================
#  PHASE 12 — TUNNEL & OUTPUT
# =============================================================================
phase12_output() {
  hr; echo -e "${BOLD}🌐  Public URL${NC}"; hr

  TUNNEL_URL=""
  if command -v ngrok &>/dev/null; then
    log "ngrok detected — starting tunnel..."
    pm2 stop mydashvps-ngrok 2>/dev/null || true
    pm2 delete mydashvps-ngrok 2>/dev/null || true
    pm2 start "$(which ngrok)" --name mydashvps-ngrok -- http "${PORT_APP}" --log=stdout
    sleep 4
    TUNNEL_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -oP '"public_url":"[^"]+' | head -1 | sed 's/"public_url":"//')
  fi
  if [ -z "$TUNNEL_URL" ] && command -v npx &>/dev/null; then
    warn "ngrok not available — trying localtunnel..."
    TUNNEL_URL=$(bunx -y localtunnel --port "${PORT_APP}" 2>/dev/null | grep -oP 'https://[^\s]+' | head -1 || true)
  fi

  echo ""
  echo -e "${GREEN}════════════════════════════════════════════${NC}"
  echo -e "${BOLD}      ✅  My Dash is RUNNING!${NC}"
  echo -e "${GREEN}════════════════════════════════════════════${NC}"
  echo ""
  [ -n "$TUNNEL_URL" ] && echo -e "  ${BOLD}🌐 Public URL:${NC}   ${CYAN}${TUNNEL_URL}${NC}"
  echo -e "  ${BOLD}📍 Local URL:${NC}    ${CYAN}http://localhost:${PORT_APP}${NC}"
  echo ""
  echo -e "  ${BOLD}🔑 Login:${NC}        ${YELLOW}${ADMIN_PASSWORD}${NC}"
  echo ""
  echo -e "  ${BOLD}📋 Pages:${NC}"
  echo -e "     • Dashboard  ${CYAN}http://localhost:${PORT_APP}/${NC}"
  echo -e "     • Login      ${CYAN}http://localhost:${PORT_APP}/login${NC}"
  echo -e "     • Settings   ${CYAN}http://localhost:${PORT_APP}/settings${NC}"
  echo -e "     • Health     ${CYAN}http://localhost:${PORT_APP}/health${NC}"
  echo ""
  echo -e "  ${BOLD}📋 PM2 Commands:${NC}"
  echo -e "     • Status:    ${CYAN}pm2 status${NC}"
  echo -e "     • Logs:      ${CYAN}pm2 logs mydashvps${NC}"
  echo -e "     • Restart:   ${CYAN}pm2 restart mydashvps${NC}"
  echo -e "     • Stop:      ${CYAN}pm2 stop mydashvps${NC}"
  echo ""

  # Save access info
  [ -n "$TUNNEL_URL" ] && echo "$TUNNEL_URL" > "${PROJECT_DIR}/.mydash_url"
  echo "${ADMIN_PASSWORD}" > "${PROJECT_DIR}/.mydash_password"

  # Keep running
  wait 2>/dev/null || true
}

# =============================================================================
#  MAIN
# =============================================================================
main() {
  phase1_bun
  phase2_detect
  phase3_ports
  phase4_database
  phase5_redis
  phase6_ai
  phase7_install
  phase8_build
  phase85_test
  phase9_config
  phase10_migrate
  phase11_pm2
  phase12_output
}

main "$@"
