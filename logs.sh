#!/usr/bin/env bash
set -euo pipefail

SERVICE="${1:-all}"

echo "================================================"
echo "  MyDash VPS — Logs ($SERVICE)"
echo "================================================"

case "$SERVICE" in
  all)
    pm2 logs --nostream --lines 50
    ;;
  backend|mydash-backend)
    pm2 logs mydash-backend --nostream --lines 50
    ;;
  ngrok|mydash-ngrok)
    pm2 logs mydash-ngrok --nostream --lines 50
    ;;
  *)
    echo "Usage: $0 [all|backend|ngrok]"
    echo ""
    echo "  all       — Show last 50 lines of all logs"
    echo "  backend   — Show last 50 lines of backend logs"
    echo "  ngrok     — Show last 50 lines of ngrok logs"
    echo ""
    echo "  Tip: Use 'pm2 logs' without arguments to stream live logs"
    exit 1
    ;;
esac
