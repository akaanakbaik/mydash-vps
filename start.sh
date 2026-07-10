#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "================================================"
echo "  MyDash VPS — Starting All Services"
echo "================================================"

# ─── Check prerequisites ──────────────────────────────────
command -v pm2 >/dev/null 2>&1 || { echo "ERROR: pm2 not found. Install with: npm install -g pm2"; exit 1; }
command -v ngrok >/dev/null 2>&1 || echo "WARN: ngrok not found. Tunnel won't start."

# ─── Create required directories ──────────────────────────
mkdir -p logs pids

# ─── Start with PM2 ───────────────────────────────────────
pm2 delete ecosystem.config.js 2>/dev/null || true
pm2 start ecosystem.config.js 2>&1

# Wait for processes to stabilize, then save for reboot persistence
sleep 3
pm2 save 2>/dev/null || true

# Enable auto-start on system boot (one-time setup)
# Run manually: pm2 startup
# Or run now:
pm2 startup 2>/dev/null | grep -v 'sudo' | head -3 || true

echo ""
echo "✅ PM2 started all services"
echo ""
echo "   Commands:"
echo "   bash status.sh           — Show status + Ngrok URL"
echo "   bash logs.sh             — View recent logs"
echo "   pm2 logs                 — Stream all logs"
echo "   pm2 logs mydash-backend  — Backend logs only"
echo "   pm2 monit                — Monitor CPU/RAM"
echo "   pm2 stop all             — Stop all services"
echo "   bash restart.sh          — Restart all services"
echo ""
echo "   Ngrok URL will appear in: pm2 logs mydash-ngrok"
echo "   or check:                curl http://127.0.0.1:4040/api/tunnels"
echo "================================================
