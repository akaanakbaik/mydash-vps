#!/usr/bin/env bash
set -euo pipefail

echo "================================================"
echo "  MyDash VPS — Stopping All Services"
echo "================================================"

pm2 stop ecosystem.config.js 2>/dev/null || echo "No PM2 processes to stop."
pm2 delete ecosystem.config.js 2>/dev/null || true

echo "✅ All services stopped."
echo "================================================"
