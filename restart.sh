#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "================================================"
echo "  MyDash VPS — Restarting All Services"
echo "================================================"

pm2 restart ecosystem.config.js 2>/dev/null || {
  echo "No running PM2 processes. Starting fresh..."
  bash start.sh
  exit 0
}

echo "✅ All services restarted."
echo "================================================"
